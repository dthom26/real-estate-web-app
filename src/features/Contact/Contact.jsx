import React from "react";
import styles from "./Contact.module.css";
import { contactInfo } from "../../data/contact";

export default function Contact() {
  return (
    <section className={styles.contactSection}>
      <div className={styles.overlay}>
        <div className={styles.contactContainer}>
          {/* Contact Info - Desktop Only */}
          <div className={styles.contactDetails}>
            <h2>Get In Touch</h2>
            <div className={styles.contactInfo}>
              <p>{contactInfo.description}</p>
              <p className={styles.contactItem}>
                <strong>Email:</strong> {contactInfo.email}
              </p>
              <p className={styles.contactItem}>
                <strong>Phone:</strong> {contactInfo.phone}
              </p>
              <p className={styles.contactItem}>
                <strong>Address:</strong> {contactInfo.address}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <span className={styles.getInTouch}>GET IN TOUCH</span>
              <h2>Contact Us</h2>
              <p>Ready to find your dream home? Let's connect!</p>
            </div>

            <form className={styles.contactForm}>
              <div className={styles.nameFields}>
                <input type="text" placeholder="FIRST NAME" required />
                <input type="text" placeholder="LAST NAME" required />
              </div>
              <input type="email" placeholder="EMAIL ADDRESS" required />
              <input type="tel" placeholder="PHONE NO." required />
              <textarea placeholder="MESSAGE" rows="4" required />
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
