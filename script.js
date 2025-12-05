document.getElementById("viewCoursesBtn").addEventListener("click", () => {
  document.getElementById("courses").scrollIntoView({ behavior: "smooth" });
});

let cart = [];

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".course-card");
    const course = {
      id: card.getAttribute("data-id"),
      name: card.querySelector("h3").textContent,
    };
    cart.push(course);
    alert(`${course.name} added to cart!`);
    console.log(cart);
  });
});
