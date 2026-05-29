import { config, fields, singleton } from "@keystatic/core";

// Local mode in dev (edits write straight to files, no login).
// GitHub mode in production (log in with GitHub from any device; edits commit
// to the repo and Vercel rebuilds). Switched by the build-time PROD flag so the
// admin shell is configured identically on the server and in the browser.
const storage = import.meta.env.PROD
  ? ({
      kind: "github",
      repo: { owner: "Abdulla-AlBassam", name: "Portfolio" },
    } as const)
  : ({ kind: "local" } as const);

export default config({
  storage,
  ui: {
    brand: { name: "Abdulla AlBassam" },
  },
  singletons: {
    about: singleton({
      label: "About",
      path: "src/data/about/",
      format: { contentField: "bio" },
      schema: {
        bio: fields.markdoc({ label: "Bio" }),
        education: fields.array(
          fields.object({
            qualification: fields.text({ label: "Qualification" }),
            institution: fields.text({ label: "Institution" }),
            period: fields.text({
              label: "Period",
              description: "e.g. 2023 – 2026",
            }),
            note: fields.text({
              label: "Note",
              description: "e.g. Predicted: First Class Honours.",
            }),
          }),
          {
            label: "Education",
            itemLabel: (props) => props.fields.qualification.value || "Entry",
          }
        ),
      },
    }),
    projects: singleton({
      label: "Projects",
      path: "src/data/projects/",
      format: { data: "yaml" },
      schema: {
        items: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            year: fields.text({
              label: "Year",
              description: "e.g. 2026, or 2025 – present",
            }),
            inProgress: fields.checkbox({
              label: "In progress",
              defaultValue: false,
            }),
            href: fields.text({
              label: "Link",
              description:
                "Optional. A full URL (https://…) or an internal path (/projects/docs/…). Leave blank for a non-clickable entry.",
            }),
            external: fields.checkbox({
              label: "Opens in a new tab",
              defaultValue: false,
            }),
            categories: fields.multiselect({
              label: "Categories",
              options: [
                { label: "Cybersecurity", value: "cybersecurity" },
                { label: "Networking", value: "networking" },
                { label: "Development", value: "development" },
                { label: "Machine Learning", value: "ml" },
              ],
            }),
            modal: fields.select({
              label: "Pop-up",
              description:
                "Attach a pre-built pop-up instead of a link. Takes precedence over the link above.",
              options: [
                { label: "None", value: "none" },
                { label: "This Portfolio", value: "portfolio" },
                { label: "Email server", value: "email-server" },
                { label: "Sweaty", value: "sweaty" },
              ],
              defaultValue: "none",
            }),
          }),
          {
            label: "Projects",
            itemLabel: (props) => props.fields.title.value || "Untitled project",
          }
        ),
      },
    }),
  },
});
