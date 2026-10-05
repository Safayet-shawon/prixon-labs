package com.praxivon.api.admin;

import com.praxivon.api.catalog.Catalog;
import com.praxivon.api.catalog.ProjectItem;
import com.praxivon.api.catalog.ServiceItem;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {
    private final Catalog catalog;
    private final AdminGuard guard;

    public AdminCatalogController(Catalog catalog, AdminGuard guard) {
        this.catalog = catalog;
        this.guard = guard;
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> catalog(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key) {
        if (!guard.allows(key)) return unauthorized();
        return ResponseEntity.ok(Map.of("services", catalog.services(), "projects", catalog.projects()));
    }

    @PostMapping("/services")
    public ResponseEntity<?> addService(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                         @RequestBody ServiceItem item) {
        if (!guard.allows(key)) return unauthorized();
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(catalog.addService(item));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                            @PathVariable String id,
                                            @RequestBody ServiceItem item) {
        if (!guard.allows(key)) return unauthorized();
        try {
            return ResponseEntity.ok(catalog.updateService(id, item));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                            @PathVariable String id) {
        if (!guard.allows(key)) return unauthorized();
        try {
            catalog.deleteService(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> addProject(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                        @RequestBody ProjectItem item) {
        if (!guard.allows(key)) return unauthorized();
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(catalog.addProject(item));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/projects/{slug}")
    public ResponseEntity<?> updateProject(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                           @PathVariable String slug,
                                           @RequestBody ProjectItem item) {
        if (!guard.allows(key)) return unauthorized();
        try {
            return ResponseEntity.ok(catalog.updateProject(slug, item));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/projects/{slug}")
    public ResponseEntity<?> deleteProject(@RequestHeader(value = "X-Praxivon-Admin", required = false) String key,
                                           @PathVariable String slug) {
        if (!guard.allows(key)) return unauthorized();
        try {
            catalog.deleteProject(slug);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    private ResponseEntity<Map<String, String>> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Admin access is required."));
    }
}