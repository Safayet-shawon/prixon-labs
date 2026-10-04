package com.praxivon.api.catalog;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {
    private final Catalog catalog;

    public CatalogController(Catalog catalog) { this.catalog = catalog; }

    @GetMapping("/services")
    public List<ServiceItem> services() { return catalog.services(); }

    @GetMapping("/projects")
    public List<ProjectItem> projects() { return catalog.projects(); }

    @GetMapping("/projects/{slug}")
    public ResponseEntity<ProjectItem> project(@PathVariable String slug) {
        return catalog.project(slug).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
