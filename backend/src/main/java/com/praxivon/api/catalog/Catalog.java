package com.praxivon.api.catalog;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class Catalog {
    private final JdbcTemplate jdbc;
    private volatile Snapshot snapshot = Snapshot.empty();

    public Catalog(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initialize() {
        if (jdbc.queryForObject("SELECT COUNT(*) FROM services", Integer.class) == 0
            && jdbc.queryForObject("SELECT COUNT(*) FROM projects", Integer.class) == 0) {
            seed();
        }
        refresh();
    }

    public List<ServiceItem> services() {
        ensureSnapshot();
        return snapshot.services();
    }

    public List<ProjectItem> projects() {
        ensureSnapshot();
        return snapshot.projects();
    }

    public Optional<ProjectItem> project(String slug) {
        return projects().stream().filter(item -> item.slug().equals(slug)).findFirst();
    }

    public synchronized ServiceItem addService(ServiceItem item) {
        validateService(item);
        int order = nextServiceOrder();
        jdbc.update("INSERT INTO services(id,title,description,category,sort_order) VALUES (?,?,?,?,?)",
            item.id(), item.title(), item.description(), item.category(), order);
        refresh();
        return services().stream().filter(s -> s.id().equals(item.id())).findFirst().orElseThrow();
    }

    public synchronized ServiceItem updateService(String id, ServiceItem item) {
        validateService(item);
        int changed = jdbc.update(
            "UPDATE services SET id=?,title=?,description=?,category=? WHERE id=?",
            item.id(), item.title(), item.description(), item.category(), id
        );
        if (changed == 0) throw new IllegalArgumentException("Service not found.");
        refresh();
        return services().stream().filter(s -> s.id().equals(item.id())).findFirst().orElseThrow();
    }

    public synchronized void deleteService(String id) {
        if (jdbc.update("DELETE FROM services WHERE id=?", id) == 0) {
            throw new IllegalArgumentException("Service not found.");
        }
        refresh();
    }

    public synchronized ProjectItem addProject(ProjectItem item) {
        validateProject(item);
        int order = nextProjectOrder();
        jdbc.update(
            "INSERT INTO projects(slug,name,type,year,summary,intro,challenge,approach,outcome,scope,visual_theme,visual_note,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            item.slug(), item.name(), item.type(), item.year(), item.summary(), item.intro(),
            item.challenge(), item.approach(), item.outcome(), String.join("|", item.scope()),
            item.visualTheme(), item.visualNote(), order
        );
        refresh();
        return project(item.slug()).orElseThrow();
    }

    public synchronized ProjectItem updateProject(String slug, ProjectItem item) {
        validateProject(item);
        int changed = jdbc.update(
            "UPDATE projects SET slug=?,name=?,type=?,year=?,summary=?,intro=?,challenge=?,approach=?,outcome=?,scope=?,visual_theme=?,visual_note=? WHERE slug=?",
            item.slug(), item.name(), item.type(), item.year(), item.summary(), item.intro(),
            item.challenge(), item.approach(), item.outcome(), String.join("|", item.scope()),
            item.visualTheme(), item.visualNote(), slug
        );
        if (changed == 0) throw new IllegalArgumentException("Project not found.");
        refresh();
        return project(item.slug()).orElseThrow();
    }

    public synchronized void deleteProject(String slug) {
        if (jdbc.update("DELETE FROM projects WHERE slug=?", slug) == 0) {
            throw new IllegalArgumentException("Project not found.");
        }
        refresh();
    }

    private void ensureSnapshot() {
        if (snapshot.services().isEmpty() && snapshot.projects().isEmpty()) refresh();
    }

    private void refresh() {
        List<ServiceItem> services = jdbc.query(
            "SELECT id,title,description,category FROM services ORDER BY sort_order,id",
            (rs, row) -> new ServiceItem(rs.getString("id"), rs.getString("title"), rs.getString("description"), rs.getString("category"))
        );
        List<ProjectItem> projects = jdbc.query(
            "SELECT slug,name,type,year,summary,intro,challenge,approach,outcome,scope,visual_theme,visual_note FROM projects ORDER BY sort_order,slug",
            (rs, row) -> new ProjectItem(
                rs.getString("slug"), rs.getString("name"), rs.getString("type"), rs.getString("year"),
                rs.getString("summary"), rs.getString("intro"), rs.getString("challenge"), rs.getString("approach"),
                rs.getString("outcome"), splitScope(rs.getString("scope")), rs.getString("visual_theme"), rs.getString("visual_note")
            )
        );
        snapshot = new Snapshot(services, projects);
    }

    private static List<String> splitScope(String value) {
        return Arrays.stream(value.split("\\|")).filter(s -> !s.isBlank()).toList();
    }

    private int nextServiceOrder() {
        return jdbc.queryForObject("SELECT COALESCE(MAX(sort_order),0)+1 FROM services", Integer.class);
    }

    private int nextProjectOrder() {
        return jdbc.queryForObject("SELECT COALESCE(MAX(sort_order),0)+1 FROM projects", Integer.class);
    }

    private static void validateService(ServiceItem item) {
        if (item.id() == null || !item.id().matches("[a-z0-9]+(?:-[a-z0-9]+)*")) throw new IllegalArgumentException("Service id must be lowercase slug format.");
        if (item.title() == null || item.title().isBlank()) throw new IllegalArgumentException("Service title is required.");
        if (item.description() == null || item.description().isBlank()) throw new IllegalArgumentException("Service description is required.");
        if (item.category() == null || item.category().isBlank()) throw new IllegalArgumentException("Service category is required.");
    }

    private static void validateProject(ProjectItem item) {
        if (item.slug() == null || !item.slug().matches("[a-z0-9]+(?:-[a-z0-9]+)*")) throw new IllegalArgumentException("Project slug must be lowercase slug format.");
        if (item.name() == null || item.name().isBlank()) throw new IllegalArgumentException("Project name is required.");
        if (item.type() == null || item.type().isBlank()) throw new IllegalArgumentException("Project type is required.");
        if (item.scope() == null || item.scope().isEmpty()) throw new IllegalArgumentException("At least one project discipline is required.");
    }

    private void seed() {
        List<ServiceItem> services = List.of(
            new ServiceItem("websites", "Websites & digital experiences", "Distinctive, fast websites built to communicate clearly and convert.", "Web & commerce"),
            new ServiceItem("ecommerce", "eCommerce", "Storefronts and buying journeys that make every interaction count.", "Web & commerce"),
            new ServiceItem("software", "Custom software", "Purpose-built platforms shaped around how your business actually works.", "Platforms & systems"),
            new ServiceItem("crm", "CRM systems", "A clearer picture of every relationship, conversation, and opportunity.", "Platforms & systems"),
            new ServiceItem("erp", "ERP systems", "Connected operations for the teams and processes behind your business.", "Platforms & systems"),
            new ServiceItem("dashboards", "Dashboards & admin panels", "Complex information turned into confident everyday decisions.", "Platforms & systems"),
            new ServiceItem("booking", "Booking & management systems", "Clear, reliable workflows for schedules, people, and places.", "Platforms & systems"),
            new ServiceItem("automation", "Automation & integrations", "Make your tools talk to each other and give your team time back.", "Growth & evolution"),
            new ServiceItem("product-design", "UI/UX & product design", "Research-led interfaces with character, clarity, and purpose.", "Design & strategy"),
            new ServiceItem("growth", "Maintenance & growth", "Thoughtful iteration, performance work, and support after launch.", "Growth & evolution"),
            new ServiceItem("inventory", "Inventory management", "Stock, orders and movements connected in one clear operational picture.", "Platforms & systems")
        );
        for (int i = 0; i < services.size(); i++) {
            ServiceItem s = services.get(i);
            jdbc.update("INSERT INTO services VALUES (?,?,?,?,?)", s.id(), s.title(), s.description(), s.category(), i + 1);
        }

        List<ProjectItem> projects = List.of(
            new ProjectItem("nexora","Nexora","Digital product / Platform","2025","A smarter way to bring complex business workflows into one clear workspace.","An ambitious platform concept shaped around the everyday decisions that move a business forward.","Fragmented tools can make essential work feel harder than it needs to be. The opportunity was to create a single, intuitive experience that brings the right information into focus.","We explored a modular product language with calm navigation, purposeful hierarchy, and dashboards designed around the tasks people return to most.","A clear product direction and flexible interface system ready for future workflows and deeper integrations.",List.of("Product strategy","UX design","Interface design","Frontend direction"),"sage","Concept presentation — imagery is illustrative."),
            new ProjectItem("rowna","ROWNA","Commerce / Brand experience","2025","An expressive commerce experience with editorial energy at every touchpoint.","A digital flagship designed to make discovery feel as compelling as the product itself.","An online store needs more than a catalog. It needs a point of view that helps people discover, trust, and remember the brand.","We built the experience around strong art direction, spacious product stories, and a direct path from inspiration to checkout.","A distinctive storefront direction with a scalable design language across campaigns and collections.",List.of("Art direction","eCommerce UX","Visual design","Responsive design"),"peach","Concept presentation — imagery is illustrative."),
            new ProjectItem("hajj-umrah","Hajj & Umrah","Booking / Operations","2025","A considered journey from first enquiry to confident travel planning.","A service platform that gives travellers clarity and teams better tools to support them.","Travel planning across packages, documents, dates, and support can quickly become overwhelming for both customers and operators.","We mapped the journey end to end and designed simple package discovery, booking states, and operational views for the team.","A practical blueprint for a calmer customer experience and a more connected management workflow.",List.of("Service design","Booking UX","Dashboard design","System architecture"),"sand","Concept presentation — imagery is illustrative."),
            new ProjectItem("tomadachi","Tomadachi","Community / Experience","2025","A playful digital home built around connection and discovery.","A community experience balancing personality, ease of use, and room to grow.","Community products need a sense of belonging while still making everyday actions effortless.","We developed a friendly visual system, clear discovery patterns, and flexible components for future features.","A warm, recognizable product direction designed for continued iteration.",List.of("Brand experience","Product design","Design system","Interaction design"),"lilac","Concept presentation — imagery is illustrative."),
            new ProjectItem("school-management","School Management","Education / SaaS","2025","Making the busy school day easier for administrators, teachers, and families.","One connected workspace for the people and processes behind better learning.","Schools coordinate information across many roles. Important details should be easy to find, update, and act on.","We organized the platform around role-specific tasks, useful status views, and a consistent interface for high-frequency work.","A structured product concept for managing school operations with greater clarity.",List.of("Workflow mapping","SaaS UX","Admin panels","UI design"),"blue","Concept presentation — imagery is illustrative.")
        );
        for (int i = 0; i < projects.size(); i++) {
            ProjectItem p = projects.get(i);
            jdbc.update("INSERT INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", p.slug(), p.name(), p.type(), p.year(), p.summary(), p.intro(), p.challenge(), p.approach(), p.outcome(), String.join("|", p.scope()), p.visualTheme(), p.visualNote(), i + 1);
        }
    }

    private record Snapshot(List<ServiceItem> services, List<ProjectItem> projects) {
        static Snapshot empty() { return new Snapshot(List.of(), List.of()); }
    }
}
