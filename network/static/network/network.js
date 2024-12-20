document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#all_button").addEventListener("click", () => load_posts("All"))
    document.querySelector("#following_button").addEventListener("click", () => load_posts("Following"))
    document.querySelector("#submit_post").addEventListener("click", submit_post)
    document.querySelector("#user_profile").addEventListener("click", () => load_profile(document.querySelector("#user_profile").innerText))

    load_posts("All");
})

function load_posts(posts) {

    document.querySelector("#Posts").style.display = "block";
    document.querySelector("#heading").style.display = "block";
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Profile").style.display = "none";

    const postsContainer = document.querySelector("#Posts");
    postsContainer.innerHTML = "";

    document.querySelector("#heading").innerHTML = `<h1>${posts}</h1>`;
    if(posts ==="All") {
        document.querySelector("#Create").style.display = "block";
    }

    fetch(`/posts/${posts}`)
        .then(res => res.json())
            .then(posts => {
                posts.forEach(post => {
                    const element = document.createElement("div");
                    element.setAttribute("id",  `post${post.id}`);
                    element.innerHTML =`
                                 <div class="border" style="margin:1%">
                                 <div style="margin: 10px">
                                 <button class ="btn btn-light" id = "profile_button"><strong>${post.author}</strong></button>
                                 <div id = "edit_div"></div> 
                                 <p id="body">${post.body}</p>
                                 <p style = "color:grey">${post.timestamp}</p>
                                 <button class = "btn btn-sm btn-outline-primary">Like </button> ${post.likes}
                                 </div>
                                 </div>`

                    if(post.edit === true) {
                        element.querySelector("#edit_div").innerHTML=`<button id = "edit_button" class = "btn btn-sm btn-outline-primary">Edit</button>`
                        element.querySelector("#edit_button").addEventListener("click", () => {
                            element.querySelector("#body").innerHTML=`<textarea id = "edit_body" placeholder="${post.body}"></textarea> <br> <button id="submit_edit" class = "btn btn-sm btn-outline-primary">Submit</button>`
                            element.querySelector("#submit_edit").addEventListener("click", () => edit_post(post.id,element.querySelector("#edit_body").value))
                        })
                    }

                    element.querySelector("#profile_button").addEventListener("click", () => load_profile(post.author));
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
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Posts").style.display = "none";
    document.querySelector("#heading").style.display = "none";
    document.querySelector("#Profile").style.display = "block";
    document.querySelector("#username_display").innerText = username;

    postsContainer = document.querySelector("#profile_posts");
    postsContainer.innerHTML = ""


    fetch(`/profile/${username}`)
    .then(response => response.json())
     .then(user => {

         if(user.is_following){
            document.querySelector("#follow_button").innerText = "Unfollow";
            document.querySelector("#follow_button").onclick = ()=> unfollow_user(username)
         }
         else{
             document.querySelector("#follow_button").innerText = "Follow";
             document.querySelector("#follow_button").onclick = ()=> follow_user(username)
        }
         document.querySelector("#followers_label").innerText = `Followers:${user.followers} Following:${user.following}`
     })

    fetch(`/profileposts/${username}`)
    .then(res => res.json())
    .then(posts => {
        posts.forEach(post => {
                    const element = document.createElement("div");
                    element.setAttribute("id", `post${post.id}`);
                    element.innerHTML =`
                                 <div class="border" style="margin:1%">
                                 <div id = "profile_button" style="margin: 10px">
                                 <button class ="btn btn-light"><strong>${post.author}</strong></button>
                                 <div id = "edit_div"></div> 
                                 <p id="body">${post.body}</p>
                                 <p style = "color:grey">${post.timestamp}</p>
                                 <button class = "btn btn-sm btn-outline-primary">Like</button> ${post.likes}
                                 </div>
                                 </div>`

            if(post.edit === true) {
                element.querySelector("#edit_div").innerHTML=`<button id = "edit_button" class = "btn btn-sm btn-outline-primary">Edit</button>`
                element.querySelector("#edit_button").addEventListener("click", () => {
                    element.querySelector("#body").innerHTML=`<textarea id = "edit_body" placeholder="${post.body}"></textarea> <br> <button id="submit_edit" class = "btn btn-sm btn-outline-primary">Submit</button>`
                    element.querySelector("#submit_edit").addEventListener("click", () => edit_post(post.id,element.querySelector("#edit_body").value))
                        })
                    }

            postsContainer.appendChild(element);
        })
    })
}

function follow_user(username) {
    fetch(`/follow/${username}`)
        .then(() => {load_profile(username)})
}
function unfollow_user(username) {
    fetch(`/unfollow/${username}`)
        .then(() => {load_profile(username)})
}

function edit_post(post_id,new_body) {
    fetch(`/edit/${post_id}`,{
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            body:new_body
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const post_element = document.querySelector(`#post${post_id}`)
            if(post_element){
                const body_element = post_element.querySelector("#body");
                body_element.textContent = new_body;
            }
            else{
                console.log("NOPE")
            }
        })

        .catch(error => {
            console.log(error)
        })
}