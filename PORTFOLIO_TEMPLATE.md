# Universal Portfolio Showcase Template & Prompt Guide

Use this reusable design guide and AI prompt template whenever you create portfolio presentation images for projects across **Fiverr, Upwork, Freelancer, Behance, Dribbble, or GitHub**.

---

## 1. Universal Showcase Standards

- **Aspect Ratio**: `16:9` (Ideal for gig galleries, work samples, and repository banners).
- **Branding Freedom**: Never include marketplace or third-party platform watermarks (e.g., no "Fiverr", "Upwork", etc.). Keep the showcase 100% universal.
- **Visual Composition**:
  - **Hero Centerpiece**: Modern sleek desktop monitor/laptop displaying an authentic screenshot of the app in dark or light mode.
  - **Header Title**: App Name + 3–4 word primary descriptor (e.g., `AppName • Client, Project & Financial Manager`).
  - **Feature Pills / Badges**: 6 symmetrical rounded feature badges with icons (3 on the left, 3 on the right) highlighting key capabilities.
  - **Lighting & Backdrop**: Soft studio gradient backdrop, realistic screen reflections, subtle ambient drop shadows.

---

## 2. Reusable AI Generation Prompt Template

When generating portfolio showcase mockups, adapt this template:

```text
A clean, ultra-professional universal SaaS portfolio presentation card displaying the dashboard application shown in the reference image. The reference UI screenshot of the [THEME: dark-mode / light-mode] dashboard is displayed inside a sleek modern display monitor with subtle soft ambient drop shadows and realistic studio reflections.

At the top, elegant typography reads: '[PROJECT_NAME] • [CATEGORY / SUBTITLE]'.

Clean modern feature pill badges surround the monitor with sleek minimal icons:
- '[FEATURE 1]'
- '[FEATURE 2]'
- '[FEATURE 3]'
- '[FEATURE 4]'
- '[FEATURE 5]'
- '[FEATURE 6]'

Premium aesthetic suitable for Upwork, Fiverr, Behance, and Dribbble portfolio showcases. No platform logos, no site names, no watermarks, completely platform-agnostic and clean.
```

---

## 3. Template Parameters for NexTrack

- **Reference Image**: [`dasshot.png`](./dasshot.png)
- **Title**: `NexTrack • Client, Project & Financial Manager`
- **Output Files**:
  - [`portfolio-showcase.jpg`](./portfolio-showcase.jpg) (Universal showcase image)
  - [`fiverr-portfolio-showcase.jpg`](./fiverr-portfolio-showcase.jpg) (Marketplace gig portfolio)
- **Feature Badges**:
  1. `Live Project Progress Tracking`
  2. `Hierarchical Tasks & Checklist`
  3. `Financial Charges & Payments`
  4. `PDF & DOCX Export`
  5. `Multi-Language (6 Languages)`
  6. `Zero-Setup Local SQLite`

---

## 4. Re-usable CLI Command (Quick Export / Overwrite)

To re-apply or duplicate the generated template image to any target directory:

```powershell
Copy-Item "portfolio-showcase.jpg" "your-target-path/portfolio.jpg" -Force
```
