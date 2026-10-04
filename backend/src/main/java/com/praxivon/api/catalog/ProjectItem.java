package com.praxivon.api.catalog;

import java.util.List;

public record ProjectItem(String slug, String name, String type, String year, String summary,
                          String intro, String challenge, String approach, String outcome,
                          List<String> scope, String visualTheme, String visualNote) {}
