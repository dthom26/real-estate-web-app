# 🚀 Quick Start Guide - FeatureGrid Component

## Installation (Already Done! ✓)

Your new components are ready to use:

- `src/components/FeatureGrid/`
- `src/features/ServicesHero/`
- `src/features/FeatureGridDemo/`

---

## 📦 What's Included

### 1. **FeatureGrid Component** (Reusable)

The core component you'll use everywhere. Handles layout and styling.

**Location:** `src/components/FeatureGrid/`

### 2. **ServicesHero Component** (Example Implementation)

A ready-to-use services showcase using FeatureGrid.

**Location:** `src/features/ServicesHero/`

### 3. **FeatureGridDemo Component** (Learning Tool)

Interactive demos showing all the ways to use FeatureGrid.

**Location:** `src/features/FeatureGridDemo/`

---

## 🎯 Quick Usage

### Option 1: Use ServicesHero (Ready to Go!)

```jsx
// In App.jsx or any page
import ServicesHero from "./features/ServicesHero/ServicesHero";

function App() {
  return (
    <>
      <Hero />
      <ServicesHero /> {/* Add this line! */}
      <About />
      {/* ... rest of your components */}
    </>
  );
}
```

### Option 2: Use FeatureGrid Directly

```jsx
import FeatureGrid from "./components/FeatureGrid/FeatureGrid";

function MyComponent() {
  return (
    <FeatureGrid columns={3}>
      <FeatureGrid.Item
        image="/path/to/image.jpg"
        title="Your Title"
        description="Optional description"
        link="/path"
      />
      {/* Add more items */}
    </FeatureGrid>
  );
}
```

### Option 3: View the Demo

```jsx
// Temporarily add to App.jsx to see all examples
import FeatureGridDemo from "./features/FeatureGridDemo/FeatureGridDemo";

function App() {
  return <FeatureGridDemo />; // See all demos!
}
```

---

## 🎨 Props Reference

### FeatureGrid Props

| Prop        | Type   | Default | Description                    |
| ----------- | ------ | ------- | ------------------------------ |
| `columns`   | number | `3`     | Number of columns (responsive) |
| `children`  | node   | -       | FeatureGrid.Item components    |
| `className` | string | `''`    | Additional CSS classes         |

### FeatureGrid.Item Props

| Prop          | Type     | Default | Description                            |
| ------------- | -------- | ------- | -------------------------------------- |
| `image`       | string   | -       | **Required.** Image URL for background |
| `title`       | string   | -       | **Required.** Main heading text        |
| `description` | string   | `null`  | Optional description text              |
| `link`        | string   | `null`  | URL to navigate to (makes it a link)   |
| `onClick`     | function | `null`  | Click handler (makes it interactive)   |
| `className`   | string   | `''`    | Additional CSS classes                 |

---

## 💡 Common Use Cases

### Services Section

```jsx
<FeatureGrid columns={3}>
  <FeatureGrid.Item title="Buying" image="..." link="/services/buying" />
  <FeatureGrid.Item title="Selling" image="..." link="/services/selling" />
  <FeatureGrid.Item title="Renting" image="..." link="/services/renting" />
</FeatureGrid>
```

### Team Members

```jsx
<FeatureGrid columns={4}>
  {team.map((member) => (
    <FeatureGrid.Item
      key={member.id}
      title={member.name}
      description={member.role}
      image={member.photo}
      link={`/team/${member.id}`}
    />
  ))}
</FeatureGrid>
```

### Stats/Achievements (Non-Interactive)

```jsx
<FeatureGrid columns={3}>
  <FeatureGrid.Item title="500+ Sales" image="..." />
  <FeatureGrid.Item title="$50M Value" image="..." />
  <FeatureGrid.Item title="15 Years" image="..." />
</FeatureGrid>
```

---

## 🎯 Next Steps

1. **Try the Demo**
   - Import `FeatureGridDemo` into `App.jsx`
   - See all the different configurations
   - Open DevTools to inspect the HTML/CSS

2. **Replace Your Current Services Section**

   ```jsx
   // Instead of:
   <Services />

   // Try:
   <ServicesHero />
   ```

3. **Customize the Data**
   - Edit `src/features/ServicesHero/ServicesHero.jsx`
   - Change titles, descriptions, images, links
   - Add your own images to `src/assets/`

4. **Style Adjustments**
   - Colors: Edit `FeatureGrid.module.css`
   - Heights: Change `min-height` in the CSS
   - Overlay darkness: Adjust `rgba(0, 0, 0, 0.4)`

5. **Create Your Own Implementation**
   - Copy `ServicesHero` folder
   - Rename to `TeamSection` or `PortfolioGrid`
   - Swap out the data
   - Reuse `FeatureGrid` component!

---

## 🐛 Troubleshooting

**Images not showing?**

- Check image paths are correct
- Use absolute paths: `/src/assets/...`
- Or use import: `import myImage from '...'`

**Columns not working on mobile?**

- This is expected! Mobile-first design stacks items
- Test on desktop or use responsive view in DevTools

**Hover effects not working?**

- Ensure you passed `link` or `onClick` prop
- Only interactive items have hover effects

**Text hard to read?**

- Increase overlay darkness in CSS: `rgba(0, 0, 0, 0.6)`
- Increase text-shadow in `.title` class

---

## 📚 Learning Resources

- **Full Guide:** `FEATURE_GRID_GUIDE.md`
- **Demo Component:** `src/features/FeatureGridDemo/`
- **Source Code:** `src/components/FeatureGrid/`

---

## 🤔 Questions?

Read through:

1. The inline comments in `FeatureGrid.jsx`
2. The comprehensive `FEATURE_GRID_GUIDE.md`
3. The six demos in `FeatureGridDemo.jsx`

Each file is heavily commented to teach you WHY things are done, not just WHAT!

---

Happy coding! 🎉
