import React from "react";
import FeatureGrid from "../../components/FeatureGrid/FeatureGrid";
import styles from "./FeatureGridDemo.module.css";

/**
 * 🎓 DEMO COMPONENT
 *
 * This file demonstrates different ways to use the FeatureGrid component.
 * Use this as a reference when implementing in your own pages!
 */

export default function FeatureGridDemo() {
  return (
    <div className={styles.demoContainer}>
      <header className={styles.demoHeader}>
        <h1>FeatureGrid Component Demos</h1>
        <p>Scroll down to see different configurations and use cases</p>
      </header>

      {/* ============================================
          DEMO 1: Basic Three-Column Services
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 1: Three-Column Services</h2>
          <p>The classic layout from the design you showed me</p>
          <code>columns={3}</code>
        </div>

        <FeatureGrid columns={3}>
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="Bespoke Marketing"
            link="#marketing"
          />
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="Property Valuation"
            link="#valuation"
          />
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="Market Leaders"
            link="#leaders"
          />
        </FeatureGrid>
      </section>

      {/* ============================================
          DEMO 2: Two-Column with Descriptions
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 2: Two-Column Layout with Descriptions</h2>
          <p>Add description prop for more content</p>
          <code>columns={2}</code>
        </div>

        <FeatureGrid columns={2}>
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="Residential Sales"
            description="Expert guidance for buying or selling your home"
            link="#residential"
          />
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="Commercial Leasing"
            description="Strategic solutions for your business property needs"
            link="#commercial"
          />
        </FeatureGrid>
      </section>

      {/* ============================================
          DEMO 3: Four-Column Team Grid
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 3: Four-Column Team Grid</h2>
          <p>Perfect for showcasing team members</p>
          <code>columns={4}</code>
        </div>

        <FeatureGrid columns={4}>
          {["Sarah Johnson", "Mike Chen", "Emma Davis", "James Wilson"].map(
            (name) => (
              <FeatureGrid.Item
                key={name}
                image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
                title={name}
                description="Senior Agent"
                link={`#${name.toLowerCase().replace(" ", "-")}`}
              />
            ),
          )}
        </FeatureGrid>
      </section>

      {/* ============================================
          DEMO 4: Data-Driven (Recommended Pattern)
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 4: Data-Driven Approach</h2>
          <p>Map over an array of data (best practice)</p>
          <code>featuresData.map()</code>
        </div>

        <DataDrivenExample />
      </section>

      {/* ============================================
          DEMO 5: Non-Interactive Cards
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 5: Non-Interactive Cards</h2>
          <p>Omit link and onClick props for display-only</p>
        </div>

        <FeatureGrid columns={3}>
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="500+ Homes Sold"
            description="Proven track record"
          />
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="$50M+ in Sales"
            description="Trusted by our clients"
          />
          <FeatureGrid.Item
            image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
            title="15 Years Experience"
            description="Expert market knowledge"
          />
        </FeatureGrid>
      </section>

      {/* ============================================
          DEMO 6: With Custom Click Handlers
          ============================================ */}
      <section className={styles.demoSection}>
        <div className={styles.demoInfo}>
          <h2>Demo 6: Custom Click Handlers</h2>
          <p>Use onClick prop for custom logic (modals, analytics, etc.)</p>
        </div>

        <ClickHandlerExample />
      </section>
    </div>
  );
}

/**
 * 🎓 TEACHING EXAMPLE: Data-Driven Approach
 *
 * This is the RECOMMENDED way to use the component.
 * Keep your data separate from your JSX!
 */
function DataDrivenExample() {
  // TIP: This data could come from:
  // - A separate data file (data/features.js)
  // - An API call (useState + useEffect)
  // - A CMS (Contentful, Sanity, etc.)
  // - Props passed from parent component

  const featuresData = [
    {
      id: "consultation",
      title: "Free Consultation",
      description: "Get expert advice at no cost",
      image: "/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg",
      link: "#consultation",
    },
    {
      id: "financing",
      title: "Financing Help",
      description: "Navigate your mortgage options",
      image: "/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg",
      link: "#financing",
    },
    {
      id: "support",
      title: "24/7 Support",
      description: "We're here when you need us",
      image: "/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg",
      link: "#support",
    },
  ];

  return (
    <FeatureGrid columns={3}>
      {featuresData.map((feature) => (
        <FeatureGrid.Item
          key={feature.id} // IMPORTANT: Use unique ID, not array index!
          image={feature.image}
          title={feature.title}
          description={feature.description}
          link={feature.link}
        />
      ))}
    </FeatureGrid>
  );
}

/**
 * 🎓 TEACHING EXAMPLE: Click Handlers
 *
 * Demonstrates how to use custom onClick handlers for:
 * - Opening modals
 * - Tracking analytics
 * - Complex interactions
 */
function ClickHandlerExample() {
  const handleFeatureClick = (featureName) => {
    // Example: Track in analytics
    console.log(`User clicked: ${featureName}`);

    // Example: Open modal
    alert(
      `You clicked ${featureName}!\n\nIn a real app, this might open a modal or navigate to a detail page.`,
    );

    // Example: Send to analytics service
    // analytics.track('Feature Clicked', { feature: featureName });
  };

  return (
    <FeatureGrid columns={3}>
      <FeatureGrid.Item
        image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
        title="Open Houses"
        onClick={() => handleFeatureClick("Open Houses")}
      />
      <FeatureGrid.Item
        image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
        title="Virtual Tours"
        onClick={() => handleFeatureClick("Virtual Tours")}
      />
      <FeatureGrid.Item
        image="/src/assets/medium-shot-woman-working-as-real-estate-agent.jpg"
        title="Market Reports"
        onClick={() => handleFeatureClick("Market Reports")}
      />
    </FeatureGrid>
  );
}
