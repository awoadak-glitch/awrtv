document.addEventListener("DOMContentLoaded", () => {
    fetch("data/awrtv_content.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("content");

            data.forEach((item, index) => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <a href="watch.html?id=${index}">
                        <img src="${item.poster}" alt="${item.title}">
                        <p>${item.title}</p>
                        <small>${item.site}</small>
                    </a>
                `;

                container.appendChild(card);
            });
        })
        .catch(err => console.error("خطأ في تحميل البيانات:", err));
});
