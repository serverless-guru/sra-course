let url = "https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users";

document.addEventListener('click', function (event) {
	event.preventDefault();
    if(event.target.matches('#getUsers')) fetchUsers()
    else if (event.target.matches('#createUser')) createUser()
    else if (event.target.matches('.deleteBtn')) deleteUser(event.target.name)
}, false);

function fetchUsers () {
    document.getElementById('showUsers').innerHTML = '';
    fetch(url, {
        method: "GET",
    }).then(async res => {
        let jsonResponse = await res.json()
        console.log(jsonResponse)
        let showUsersHTML = "<div>";
        console.log(jsonResponse.data.Items)
        if(jsonResponse.data.Count > 0) {
            jsonResponse.data.Items.forEach(item => {
                showUsersHTML += `<h2>${item.name}</h2><p>${item.name} works as a ${item.job}.</p><button class="deleteBtn" name="${item.user_id}">Delete</button>`;
            });
        } else {
            showUsersHTML = "no users found in database"
        }
        showUsersHTML += "</div>";
        document.querySelector('#showUsers').insertAdjacentHTML(
            'afterbegin',
            showUsersHTML
        );
    });
}

function createUser () {
    fetch(url, {
        method: "POST", 
        body: JSON.stringify({
            name: document.getElementById("nameInput").value,
            job: document.getElementById("jobInput").value
        })
    }).then(async res => {
        let jsonResponse = await res.json()
        console.log(jsonResponse)
        document.querySelector('#showCreateUserMessage').insertAdjacentHTML(
            'afterbegin',
            "<p>User has been added</p>"
        );
        fetchUsers()
    }).catch(async res => console.log(await res.json()))
}

function deleteUser (userId) {
    fetch(`${url}/${userId}`, {
        method: "DELETE"
    })
    .then(res => fetchUsers())
    .catch(async res => console.log(await res.json()))
}