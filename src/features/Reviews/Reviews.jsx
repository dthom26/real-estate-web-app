import { useState } from "react";
import style from "./Reviews.module.css";
import BaseCard from "../../components/BaseCard/BaseCard";
import reviewsData from "../../data/reviews";

const Reviews = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null); // 'left' or 'right'
  const total = reviewsData.length;

  // handle function for next review
  const goToNext = () => {
    if (isAnimating) return; // Prevent rapid clicks

    setDirection("left"); // Card slides out to the left
    setIsAnimating(true);

    setTimeout(() => {
      setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
      setDirection(null);
      setIsAnimating(false);
    }, 400); // Match CSS transition duration
  };

  // handle function for previous review
  const goToPrev = () => {
    if (isAnimating) return; // Prevent rapid clicks

    setDirection("right"); // Card slides out to the right
    setIsAnimating(true);

    setTimeout(() => {
      setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
      setDirection(null);
      setIsAnimating(false);
    }, 400); // Match CSS transition duration
  };
  return (
    <div className={style.reviewContainer}>
      <section className={"section " + style.reviewSection}>
        <button
          onClick={goToPrev}
          aria-label="Previous review"
          className={style.arrowBtn + " " + style.left}
          disabled={isAnimating}
        >
          <span aria-hidden="true">&#8592;</span>
        </button>
        <BaseCard
          variant="elevated"
          className={
            style.reviewCard +
            (direction === "left" ? " " + style.slideOutLeft : "") +
            (direction === "right" ? " " + style.slideOutRight : "")
          }
        >
          <BaseCard.Body>{`"${reviewsData[current].comment}"`}</BaseCard.Body>
          <BaseCard.Title as="h3">{reviewsData[current].name}</BaseCard.Title>
        </BaseCard>
        <button
          onClick={goToNext}
          aria-label="Next review"
          className={style.arrowBtn + " " + style.right}
          disabled={isAnimating}
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
        <div className={style.navigation}></div>
        <div className={style.pagination}>
          {reviewsData.map((_, idx) => (
            <button
              key={idx}
              className={
                style.dot + (idx === current ? " " + style.activeDot : "")
              }
              onClick={() => {
                if (isAnimating || idx === current) return;
                setDirection(idx > current ? "left" : "right");
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrent(idx);
                  setDirection(null);
                  setIsAnimating(false);
                }, 400);
              }}
              aria-label={`Go to review ${idx + 1}`}
              aria-current={idx === current ? "true" : undefined}
              disabled={isAnimating}
            />
          ))}
        </div>
        <div className={style.srOnly} aria-live="polite">
          {current + 1} of {total}
        </div>
      </section>
    </div>
  );
};

export default Reviews;
