package com.praxivon.api.catalog;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class Catalog {
    private final List<ServiceItem> services = List.of(
        new ServiceItem("websites", "Websites & digital experiences", "Distinctive, fast websites built to communicate clearly and convert.", "Web & commerce"),
        new ServiceItem("ecommerce", "eCommerce", "Storefronts and buying journeys that make every interaction count.", "Web & commerce"),
        new ServiceItem("software", "Custom software", "Purpose-built platforms shaped around how your business actually works.", "Platforms & systems"),
        new ServiceItem("crm-erp", "CRM & ERP", "Connected systems for customers, operations, and the teams behind them.", "Platforms & systems"),
        new ServiceItem("dashboards", "Dashboards & admin panels", "Complex information turned into confident everyday decisions.", "Platforms & systems"),
        new ServiceItem("booking", "Booking & management systems", "Clear, reliable workflows for schedules, people, and places.", "Platforms & systems"),
        new ServiceItem("automation", "Automation & integrations", "Make your tools talk to each other and give your team time back.", "Growth & evolution"),
        new ServiceItem("product-design", "UI/UX & product design", "Research-led interfaces with character, clarity, and purpose.", "Design & strategy"),
        new ServiceItem("growth", "Maintenance & growth", "Thoughtful iteration, performance work, and support after launch.", "Growth & evolution")
    );

    private final List<ProjectItem> projects = List.of(
        new ProjectItem("nexora", "Nexora", "Digital product / Platform", "2025",
            "A smarter way to bring complex business workflows into one clear workspace.",
            "An ambitious platform concept shaped around the everyday decisions that move a business forward.",
            "Fragmented tools can make essential work feel harder than it needs to be. The opportunity was to create a single, intuitive experience that brings the right information into focus.",
            "We explored a modular product language with calm navigation, purposeful hierarchy, and dashboards designed around the tasks people return to most.",
            "A clear product direction and flexible interface system ready for future workflows and deeper integrations.",
            List.of("Product strategy", "UX design", "Interface design", "Frontend direction"), "sage", "Concept presentation — imagery is illustrative."),
        new ProjectItem("rowna", "ROWNA", "Commerce / Brand experience", "2025",
            "An expressive commerce experience with editorial energy at every touchpoint.",
            "A digital flagship designed to make discovery feel as compelling as the product itself.",
            "An online store needs more than a catalog. It needs a point of view that helps people discover, trust, and remember the brand.",
            "We built the experience around strong art direction, spacious product stories, and a direct path from inspiration to checkout.",
            "A distinctive storefront direction with a scalable design language across campaigns and collections.",
            List.of("Art direction", "eCommerce UX", "Visual design", "Responsive design"), "peach", "Concept presentation — imagery is illustrative."),
        new ProjectItem("hajj-umrah", "Hajj & Umrah", "Booking / Operations", "2025",
            "A considered journey from first enquiry to confident travel planning.",
            "A service platform that gives travellers clarity and teams better tools to support them.",
            "Travel planning across packages, documents, dates, and support can quickly become overwhelming for both customers and operators.",
            "We mapped the journey end to end and designed simple package discovery, booking states, and operational views for the team.",
            "A practical blueprint for a calmer customer experience and a more connected management workflow.",
            List.of("Service design", "Booking UX", "Dashboard design", "System architecture"), "sand", "Concept presentation — imagery is illustrative."),
        new ProjectItem("tomadachi", "Tomadachi", "Community / Experience", "2025",
            "A playful digital home built around connection and discovery.",
            "A community experience balancing personality, ease of use, and room to grow.",
            "Community products need a sense of belonging while still making everyday actions effortless.",
            "We developed a friendly visual system, clear discovery patterns, and flexible components for future features.",
            "A warm, recognizable product direction designed for continued iteration.",
            List.of("Brand experience", "Product design", "Design system", "Interaction design"), "lilac", "Concept presentation — imagery is illustrative."),
        new ProjectItem("school-management", "School Management", "Education / SaaS", "2025",
            "Making the busy school day easier for administrators, teachers, and families.",
            "One connected workspace for the people and processes behind better learning.",
            "Schools coordinate information across many roles. Important details should be easy to find, update, and act on.",
            "We organized the platform around role-specific tasks, useful status views, and a consistent interface for high-frequency work.",
            "A structured product concept for managing school operations with greater clarity.",
            List.of("Workflow mapping", "SaaS UX", "Admin panels", "UI design"), "blue", "Concept presentation — imagery is illustrative.")
    );

    public List<ServiceItem> services() { return services; }
    public List<ProjectItem> projects() { return projects; }
    public Optional<ProjectItem> project(String slug) {
        return projects.stream().filter(project -> project.slug().equals(slug)).findFirst();
    }
}
