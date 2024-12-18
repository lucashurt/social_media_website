document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#all_button").addEventListener("click", () => load_posts("All"))
    document.querySelector("#following_button").addEventListener("click", () => load_posts("Following"))
    document.querySelector("#submit_post").addEventListener("click", submit_post)

load_posts("All");
})

function load_posts(posts) {
    event.preventDefault()
    document.querySelector("#Posts").style.display = "block";
    document.querySelector("h1").innerText = posts;
    document.querySelector("#create").style.display = "none";

    if(posts ==="All") {
        document.querySelector("#create").style.display = "block";
    }
    fetch(`/posts/${posts}`)
    .then(res => res.json())
    .then(posts => {
        posts.forEach(post => {
            const element = document.createElement("div");
            element.innerHTML =`
                                 <div class="border" style="margin:1%">
                                 <div style="margin: 10px">
                                 <label><strong>${post.author}</strong></label>
                                 <p>${post.body}</p>
                                 <p style = "color:grey">${post.timestamp}</p>
                                 <button class = "btn btn-sm btn-outline-primary">Like </button> ${post.likes}
                                 
                                 </div>
                                 </div>`
                    document.querySelector("body").append(element)
        })
    })
}

function submit_post() {
    fetch("/posts",{
        method: "POST",
        body: JSON.stringify({
            body: document.querySelector("#newPost").value
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            load_posts("All Posts");
        })
}