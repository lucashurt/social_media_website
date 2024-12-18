document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#all_button").addEventListener("click", () => load_posts("All"))
    document.querySelector("#following_button").addEventListener("click", () => load_posts("Following"))
    document.querySelector("#submit_post").addEventListener("click", submit_post)

    load_posts("All");
})

function load_posts(posts) {
    event.preventDefault()
    document.querySelector("#Posts").style.display = "block";
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Profile").style.display = "none";


    const postsContainer = document.querySelector("#Posts");
    postsContainer.innerHTML = ""; // Clears any previous posts

    document.querySelector("#Posts").innerHTML = `<h1>${posts}</h1>`;

    if(posts ==="All") {
        document.querySelector("#Create").style.display = "block";
    }
    fetch(`/posts/${posts}`)
        .then(res => res.json())
            .then(posts => {
                posts.forEach(post => {

                    const element = document.createElement("div");
                    element.innerHTML =`
                                 <div class="border" style="margin:1%">
                                 <div id = "profile_button" style="margin: 10px">
                                 <button class ="btn btn-light"><strong>${post.author}</strong></button>
                                 <p>${post.body}</p>
                                 <p style = "color:grey">${post.timestamp}</p>
                                 <button class = "btn btn-sm btn-outline-primary">Like </button> ${post.likes}
                                 </div>
                                 </div>`
            postsContainer.appendChild(element);
        })
    })
        .catch(error => {
            console.error("Error loading posts:", error);
        });

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
            load_posts("All");
        })
}

function load_profile(username){
    event.preventDefault()
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Posts").style.display = "none";
    document.querySelector("#Profile").style.display = "block";

    document.querySelector("h1").innerHTML = username;
}