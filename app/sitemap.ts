import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://streamx.app";
  const lastModifiedDate = new Date();
  return [
    // Homepage
    {
      url: `${baseUrl}/`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 1,
    },
    // Home page
    {
      url: `${baseUrl}/home`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Movies section
    {
      url: `${baseUrl}/movies`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // Movies browse page
    {
      url: `${baseUrl}/movies/browse`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // TV Shows section
    {
      url: `${baseUrl}/tvshows`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // TV Shows browse page
    {
      url: `${baseUrl}/tvshows/browse`,
      lastModified: lastModifiedDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Search page
    {
      url: `${baseUrl}/search`,
      lastModified: lastModifiedDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: lastModifiedDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastModifiedDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: lastModifiedDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: lastModifiedDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
