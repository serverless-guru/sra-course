document.addEventListener('click', function (event) {

	// Don't follow the link
	event.preventDefault();

    if(event.target.matches('#getUsers')) {
        document.getElementById('showUsers').innerHTML = '';
        fetch("https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users", {
            method: "GET", 
            // body: JSON.stringify(data)
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
    } else if (event.target.matches('#createUser')) {
        fetch("https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users", {
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
            document.getElementById('showUsers').innerHTML = '';
            fetch("https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users", {
                method: "GET", 
                // body: JSON.stringify(data)
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
                })
        }).catch(async res => console.log(await res.json()))
    } else if (event.target.matches('.deleteBtn')) {
        console.log(event.target.name)
        fetch(`https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users/${event.target.name}`, {
            method: "DELETE"
        }).then(async res => {
            let jsonResponse = await res.json()
            console.log(jsonResponse)
            document.getElementById('showUsers').innerHTML = '';
            fetch("https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users", {
                method: "GET", 
                // body: JSON.stringify(data)
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
                })
        }).catch(async res => console.log(await res.json()))
    }
}, false);


// var xhr = new XMLHttpRequest();
// xhr.open("POST", "https://q39q2b06b0.execute-api.us-west-2.amazonaws.com/dev/users", true);
// xhr.setRequestHeader('Content-Type', 'application/json');
// xhr.send(JSON.stringify({
//     name: "ryan",
//     job: "dev"
// }));