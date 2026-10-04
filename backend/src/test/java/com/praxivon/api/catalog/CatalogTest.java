package com.praxivon.api.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class CatalogTest {
    private final Catalog catalog = new Catalog();

    @Test
    void exposesTheCompleteServiceAndProjectCatalog() {
        assertEquals(11, catalog.services().size());
        assertEquals(5, catalog.projects().size());
        assertTrue(catalog.project("nexora").isPresent());
        assertTrue(catalog.project("unknown").isEmpty());
    }
}
