# 🎓 Component Patterns Comparison

## Understanding When to Use Each Component

You now have multiple components in your toolkit. Let's understand when to use each one!

---

## 🎯 Component Overview

### 1. **FeatureGrid** (NEW!)

**Purpose:** Full-width image backgrounds with text overlays  
**Best For:** Hero sections, service highlights, portfolio showcases  
**Visual Style:** Dramatic, image-focused, high-impact

### 2. **BaseCard** (Existing)

**Purpose:** Contained cards with clear boundaries  
**Best For:** Service details, blog posts, product listings  
**Visual Style:** Clean, structured, content-focused

### 3. **TextImageSection** (Existing)

**Purpose:** Alternating text and image sections  
**Best For:** About pages, feature explanations, storytelling  
**Visual Style:** Balanced, readable, narrative

---

## 📊 Side-by-Side Comparison

| Feature             | FeatureGrid       | BaseCard           | TextImageSection       |
| ------------------- | ----------------- | ------------------ | ---------------------- |
| **Layout**          | Grid (full-width) | Grid (contained)   | Two-column alternating |
| **Images**          | Background (full) | Inline (contained) | Side-by-side           |
| **Text Visibility** | Overlaid on image | Below/above image  | Beside image           |
| **Best Screen**     | Desktop & tablet  | All screens        | Desktop & tablet       |
| **Visual Impact**   | ⭐⭐⭐⭐⭐ High   | ⭐⭐⭐ Medium      | ⭐⭐⭐⭐ High          |
| **Content Density** | ⭐⭐ Low          | ⭐⭐⭐⭐ High      | ⭐⭐⭐⭐⭐ Very High   |
| **Use Case**        | First impression  | Detailed info      | Explanations           |

---

## 🎨 Visual Examples

### FeatureGrid

```
┌───────────────┬───────────────┬───────────────┐
│   [IMAGE]     │   [IMAGE]     │   [IMAGE]     │
│               │               │               │
│   TITLE 1     │   TITLE 2     │   TITLE 3     │
│               │               │               │
└───────────────┴───────────────┴───────────────┘
```

**Feel:** Bold, dramatic, cinematic  
**Message:** "Wow, look at this!"

### BaseCard

```
┌──────┐  ┌──────┐  ┌──────┐
│[IMG] │  │[IMG] │  │[IMG] │
├──────┤  ├──────┤  ├──────┤
│Title │  │Title │  │Title │
│Text  │  │Text  │  │Text  │
│Button│  │Button│  │Button│
└──────┘  └──────┘  └──────┘
```

**Feel:** Clean, organized, informative  
**Message:** "Here's the information you need"

### TextImageSection

```
┌──────────────────────────────────┐
│ [TEXT CONTENT]  │  [IMAGE]       │
├──────────────────────────────────┤
│ [IMAGE]  │  [TEXT CONTENT]       │
└──────────────────────────────────┘
```

**Feel:** Balanced, narrative, professional  
**Message:** "Let me tell you a story"

---

## 🎯 Use Case Scenarios

### Scenario 1: Landing Page Hero Section

**Choose:** FeatureGrid

```jsx
<FeatureGrid columns={3}>
  <FeatureGrid.Item title="Bespoke Marketing" image="..." />
  <FeatureGrid.Item title="Property Valuation" image="..." />
  <FeatureGrid.Item title="Market Leaders" image="..." />
</FeatureGrid>
```

**Why?** Maximum visual impact for first impression

---

### Scenario 2: Detailed Services List

**Choose:** BaseCard

```jsx
<div className={styles.servicesGrid}>
  {services.map((service) => (
    <BaseCard>
      <BaseCard.Image src={service.image} />
      <BaseCard.Content>
        <BaseCard.Title>{service.title}</BaseCard.Title>
        <BaseCard.Body>{service.description}</BaseCard.Body>
      </BaseCard.Content>
      <BaseCard.Footer>
        <button>Learn More</button>
      </BaseCard.Footer>
    </BaseCard>
  ))}
</div>
```

**Why?** Clear structure for detailed information + actions

---

### Scenario 3: About Section

**Choose:** TextImageSection

```jsx
<TextImageSection
  title="Our Story"
  description="Long-form text about company history..."
  image="team-photo.jpg"
  imagePosition="right"
/>
```

**Why?** Great for storytelling and detailed explanations

---

## 🏗️ Combining Patterns (Recommended!)

The most effective websites use ALL patterns strategically:

```jsx
function HomePage() {
  return (
    <>
      {/* 1. HERO: Big visual impact */}
      <Hero />

      {/* 2. FEATURE GRID: Quick overview of main services */}
      <FeatureGrid columns={3}>
        <FeatureGrid.Item title="Service 1" ... />
        <FeatureGrid.Item title="Service 2" ... />
        <FeatureGrid.Item title="Service 3" ... />
      </FeatureGrid>

      {/* 3. TEXT+IMAGE: Detailed about section */}
      <TextImageSection
        title="Why Choose Us"
        description="Detailed explanation..."
      />

      {/* 4. BASE CARDS: Detailed service breakdown */}
      <section>
        <h2>All Our Services</h2>
        <div className={styles.grid}>
          {services.map(service => (
            <BaseCard>{/* ... */}</BaseCard>
          ))}
        </div>
      </section>

      {/* 5. FEATURE GRID: Team or testimonials */}
      <FeatureGrid columns={4}>
        {team.map(member => (
          <FeatureGrid.Item title={member.name} ... />
        ))}
      </FeatureGrid>
    </>
  );
}
```

---

## 🧠 Decision Tree

Use this to decide which component to use:

```
Do you want maximum visual impact?
├─ YES → Is the image the star of the show?
│        ├─ YES → FeatureGrid
│        └─ NO → TextImageSection
│
└─ NO → Do you need structured, detailed information?
         ├─ YES → BaseCard
         └─ NO → TextImageSection
```

---

## 💡 Pro Tips

### 1. **Start Wide, Get Specific**

```
Page Flow:
FeatureGrid (wide, dramatic)
    ↓
TextImageSection (balanced, informative)
    ↓
BaseCard (detailed, actionable)
```

### 2. **Consider Reading Patterns**

- FeatureGrid: Scannability (F-pattern)
- BaseCard: Comparison (Z-pattern)
- TextImageSection: Reading (Linear)

### 3. **Mobile Matters**

- FeatureGrid: Stacks vertically → Consider having 2-3 items max
- BaseCard: Perfect for mobile scrolling
- TextImageSection: Image above text on mobile

### 4. **Accessibility**

- FeatureGrid: Ensure text contrast on images
- BaseCard: Natural tab order and focus states
- TextImageSection: Alt text for all images

---

## 🎓 Learning Exercise

Try recreating your current Services section in THREE ways:

1. **Version A:** Use FeatureGrid
2. **Version B:** Use BaseCard (current)
3. **Version C:** Use TextImageSection

Then ask yourself:

- Which version communicates best?
- Which version looks most professional?
- Which version provides the most information?
- Which version matches your brand?

There's no "right" answer! The best choice depends on:

- Your content
- Your audience
- Your brand identity
- Your business goals

---

## 📚 Further Study

### When Your Site Grows...

**Add:**

- **Carousel/Slider:** For many items in limited space
- **Modal/Dialog:** For detailed information without leaving page
- **Accordion:** For FAQ sections
- **Tabs:** For organized, categorized content

**Pattern Library Example:**

```
components/
  ├─ FeatureGrid/      ← Hero sections
  ├─ BaseCard/         ← Content cards
  ├─ Carousel/         ← Image galleries
  ├─ Modal/            ← Pop-up details
  └─ Accordion/        ← FAQs
```

Each component has ONE job and does it well!

---

## 🚀 Your Next Steps

1. ✅ Understand the differences between components
2. ✅ Know when to use each one
3. ⬜ Try the FeatureGridDemo to see it in action
4. ⬜ Replace one section of your site
5. ⬜ Measure the impact (user feedback, analytics)
6. ⬜ Iterate and improve!

---

Remember: **There's no "best" component—only the best component for the job!** 🎯
