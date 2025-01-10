document.addEventListener("DOMContentLoaded", function() {
   document.querySelector("#all_button").addEventListener("click", () => load_posts("All"))

    load_posts("All");

    document.querySelector("#submit_post").addEventListener("click", submit_post)
    document.querySelector("#user_profile").addEventListener("click", () => load_profile(document.querySelector("#user_profile").innerText))
    document.querySelector("#following_button").addEventListener("click", () => load_posts("Following"))

})


let currentAllPage = 1
let currentFollowingPage = 1

function load_posts(inbox) {
    let currentPage = 1
    if(inbox === "All") {
        currentPage = currentAllPage
    }
    else{
        currentPage = currentFollowingPage
    }
    document.querySelector("#Posts").style.display = "block";
    document.querySelector("#heading").style.display = "block";
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Profile").style.display = "none";

    const postsContainer = document.querySelector("#Posts");
    postsContainer.innerHTML = "";

    document.querySelector("#heading").innerHTML = `<h1>${inbox}</h1>`;
    if(inbox ==="All") {
        document.querySelector("#Create").style.display = "block";
    }

    fetch(`/posts/${inbox}?page=${currentPage}`)
        .then(res => res.json())
            .then(data => {
                const posts = data.posts
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
                                 <button id="like_button" class = "btn btn-sm btn-outline-primary"></button> 
                                 <div class ="row" style = "margin-left:1px">Likes: <p id="like_number">${post.likes}</p></div>
                                 </div>
                                 </div>`

                    if(post.liked === false){
                        element.querySelector("#like_button").innerText = "Like"
                        element.querySelector("#like_button").onclick =  () => like_post(post.id)
                    }
                    else {
                        element.querySelector("#like_button").innerText = "Remove Like"
                        element.querySelector("#like_button").onclick = () => dislike_post(post.id)
                    }

                    if(post.edit === true) {
                        element.querySelector("#edit_div").innerHTML=`<button id = "edit_button" class = "btn btn-sm btn-outline-primary">Edit</button>`

                        element.querySelector("#edit_button").addEventListener("click", () =>{
                            const current_body = element.querySelector("#body").textContent;
                            element.querySelector("#body").innerHTML=`<textarea id = "edit_body" placeholder="${current_body}"></textarea> <br> <button id="submit_edit" class = "btn btn-sm btn-outline-primary">Submit</button>`
                            element.querySelector("#submit_edit").addEventListener("click", () => edit_post(post.id,element.querySelector("#edit_body").value))

                    })
                    }
                    element.querySelector("#profile_button").addEventListener("click", () => load_profile(post.author));
            postsContainer.appendChild(element);
        })
            const paginationContainer = document.createElement("div");
            paginationContainer.innerHTML = `
                <button class="btn btn-sm btn-primary" id="prevPage" ${!data.has_previous_page ? "disabled" : ""}>Previous</button>
                <button class="btn btn-sm btn-primary" id="nextPage" ${!data.has_next_page ? "disabled" : ""}>Next</button>`;
            postsContainer.appendChild(paginationContainer);

            document.querySelector("#prevPage").addEventListener("click", () => {
                if(inbox ==="All") {
                    if (currentAllPage > 1) {
                    currentAllPage--;
                    load_posts(inbox)
                }
                }
                else {
                    if (currentFollowingPage > 1) {
                        currentFollowingPage--;
                        load_posts(inbox)

                    }
                }
            });
            document.querySelector("#nextPage").addEventListener("click", () => {
                if(inbox ==="All") {
                    currentAllPage++;
                }
                else {
                    currentFollowingPage++;
                }
                load_posts(inbox);
            });
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

let profilePageNumbers = {}
function load_profile(username){
    document.querySelector("#Create").style.display = "none";
    document.querySelector("#Posts").style.display = "none";
    document.querySelector("#heading").style.display = "none";
    document.querySelector("#Profile").style.display = "block";
    document.querySelector("#follow_button_div").style.display = "block"

    document.querySelector("#username_display").innerText = username;
    let pageNumber = 0

    if(username in profilePageNumbers){
        pageNumber = profilePageNumbers[username];}
    else{
        profilePageNumbers[username] = 1;
        pageNumber = profilePageNumbers[username];
    }
    const postsContainer = document.querySelector("#profile_posts");
    postsContainer.innerHTML = ""

    fetch(`/profile/${username}`)
    .then(response => response.json())
     .then(user => {
         document.querySelector("#followers_label").innerText = `Followers:${user.followers} Following:${user.following}`

         if(user.is_following){
            document.querySelector("#follow_button").innerText = "Unfollow";
            document.querySelector("#follow_button").onclick = ()=> unfollow_user(username)
         }
         else if(user.not_user){
             document.querySelector("#follow_button").innerText = "Follow";
             document.querySelector("#follow_button").onclick = ()=> follow_user(username)
        }
         else{
             document.querySelector("#follow_button_div").style.display = "none"
         }
     })

    fetch(`/profileposts/${username}?page=${pageNumber}`)
    .then(res => res.json())
    .then(data => {

        const posts = data.posts
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
                                 <button id="like_button" class = "btn btn-sm btn-outline-primary"></button> 
                                 <div class ="row" style = "margin-left:1px">Likes: <p id="like_number">${post.likes}</p></div>
                                 </div>
                                 </div>`

                    if(post.liked === false){
                        element.querySelector("#like_button").innerText = "Like"
                        element.querySelector("#like_button").onclick =  () => like_post(post.id)
                    }
                    else {
                        element.querySelector("#like_button").innerText = "Remove Like"
                        element.querySelector("#like_button").onclick = () => dislike_post(post.id)
                    }

            if(post.edit === true) {
                element.querySelector("#edit_div").innerHTML=`<button id = "edit_button" class = "btn btn-sm btn-outline-primary">Edit</button>`
                element.querySelector("#edit_button").addEventListener("click", () => {
                    element.querySelector("#body").innerHTML=`<textarea id = "edit_body" placeholder="${post.body}"></textarea> <br> <button id="submit_edit" class = "btn btn-sm btn-outline-primary">Submit</button>`
                    element.querySelector("#submit_edit").addEventListener("click", () => edit_post(post.id,element.querySelector("#edit_body").value))
                        })
                    }

            postsContainer.appendChild(element);
        })
        const paginationContainer = document.createElement("div");
        paginationContainer.innerHTML = `
        <button class = "btn btn-sm btn-primary" id = "previousPage" ${!data.has_previous_page ? "disabled": ""}>Previous</button>
        <button class = "btn btn-sm btn-primary" id = "followingPage" ${!data.has_next_page ? "disabled": ""}>Next</button> `
        postsContainer.appendChild(paginationContainer);

        document.querySelector("#previousPage").addEventListener("click", () => {
            if(pageNumber > 1){
                profilePageNumbers[username]--;
                load_profile(username)
            }
        })
        document.querySelector("#followingPage").addEventListener("click", () => {
            profilePageNumbers[username]++;
            load_profile(username)
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
        .then(() => {
            const post_element = document.querySelector(`#post${post_id}`)
            if(post_element){
                const body_element = post_element.querySelector("#body");
                body_element.querySelector("#edit_body").placeholder=new_body;
                body_element.textContent = new_body;
            }
        })

        .catch(error => {
            console.log(error)
        })
}
function like_post(post_id) {
    fetch(`/like/${post_id}`, {
        method: "PUT",
    })
        .then((res) => res.json())
        .then(() => {
            const postElement = document.querySelector(`#post${post_id}`);
            if (postElement) {
                const likeButton = postElement.querySelector("#like_button");
                const likeNumber = postElement.querySelector("#like_number");

                likeButton.innerText = "Dislike";
                likeButton.onclick = () => dislike_post(post_id)

                likeNumber.textContent = parseInt(likeNumber.textContent) + 1;
            }
        })
        .catch((error) => {
            console.error("Error liking post:", error);
        });
}

function dislike_post(post_id) {
    fetch(`/dislike/${post_id}`, {
        method: "PUT",
    })
        .then((res) => res.json())
        .then(() => {
            const postElement = document.querySelector(`#post${post_id}`);
            if (postElement) {
                const likeButton = postElement.querySelector("#like_button");
                const likeNumber = postElement.querySelector("#like_number");

                likeButton.innerText = "Like";
                likeButton.onclick = () => like_post(post_id)

                likeNumber.textContent = parseInt(likeNumber.textContent) - 1;
            }
        })
        .catch((error) => {
            console.error("Error disliking post:", error);
        });}
