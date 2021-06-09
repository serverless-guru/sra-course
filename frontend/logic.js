let url = "https://k0km2xgfef.execute-api.us-east-2.amazonaws.com/prod/users";

document.addEventListener('click', function (event) {
	event.preventDefault();
    if(event.target.matches('#getUsers')) fetchUsers()
    else if (event.target.matches('#createUser')) createUser()
    else if (event.target.matches('.deleteBtn')) deleteUser(event.target.name)
    else if (event.target.matches('.updateConfirmBtn')) updateUser(event.target.name)
    else if (event.target.matches('.showUpdateFormBtn')) showUpdateUserForm(event.target.name)
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
                showUsersHTML += `<div id="user${item.user_id}"><h2>${item.name}</h2><p>${item.name} works as a ${item.job}.</p><button class="deleteBtn" name="${item.user_id}">Delete</button><button class="showUpdateFormBtn" name="${item.user_id}">Update</button></div>`;
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

function updateUser (userId) {
    fetch(`${url}/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
            name: document.getElementById("nameUpdateInput").value,
            job: document.getElementById("jobUpdateInput").value
        })
    })
    .then(res => fetchUsers())
    .catch(async res => console.log(await res.json()))
}

function getUser (userId) {
    return new Promise(resolve => {
        fetch(`${url}/${userId}`, {
            method: "GET"
        })
        .then(async res => resolve(await res.json()))
        .catch(async res => console.log(await res.json()))
    })
}

async function showUpdateUserForm (userId) {
    let userData = await getUser(userId)
    console.log(userData)
    document.getElementById(`user${userId}`).innerHTML += `Name<input type="text" id="nameUpdateInput" value="${userData.data.Item.name}"> Job<input type="text" id="jobUpdateInput" value="${userData.data.Item.job}"><button class="updateConfirmBtn" name="${userId}">Confirm</button>`;
}