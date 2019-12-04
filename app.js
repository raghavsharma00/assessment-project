const select = document.getElementById('breeds');
const card = document.querySelector('.card'); 
const form = document.querySelector('form');

// ------------------------------------------
//  FETCH FUNCTIONS
// ------------------------------------------
// fetch() method returns a promise object - is fulfilled when the browser receives a response from the server

// Creates a generic fetch() function which renders result to JSON, when string URL is passed through
function fetchData(url) {
    return fetch(url) // checks the status of the response => then parses to JSON => otherwise will catch error
        // .then(res => console.log(res))
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log(`Ruh-roh! Something's gone wrong.`, error)) // if promise cannot be fulfilled, e.g. if API URL is incorrect
}

// ---------- Using Promise.all ----------//
// Accepts any iterable (string or array, usually an array of promises)
// Fetch both URLs, wait for both to return before moving on, once resolved, used response to generate options and random images
// Composing multiple promises into a single returned promise - one returned array of values
// Either all promises must succeed, or catch will be triggered
Promise.all([
    // Using breeds list endpoint to return a list of all the master breeds and populate the select
    fetchData('https://dog.ceo/api/breeds/list'),
    // To display the random dog url on the page
    fetchData('https://dog.ceo/api/breeds/image/random')
  ])
  // When promise is successfully resolved, returned as an array of values, values returned from completed promises in the same order they were passed in
  // To view array returned by Promise.all:
  // .then(data => console.log(data))
    .then(data => {
      const breedList = data[0].message;
      const randomImage = data[1].message;
      
      generateOptions(breedList);
      generateImage(randomImage);
    })

// ------------------------------------------
//  HELPER FUNCTIONS
// ------------------------------------------
// How to handle failed HTTP responses - to check if response object does not return ok:true
// To throw and error, create a new function to check if the promise resolved with the response objects ok property set to true 
function checkStatus(response) {
    // Passes in response, if response key set to OK is true, the promise is resolved with the response
    if (response.ok) {
        // Resolved with the given value - ie. the response object
        return Promise.resolve(response);
    } else {
        // If resolve is unsuccessful, reject the promise, which will activate the catch call, return an Error object
        // Error description is set to response statusText
        return Promise.reject(new Error(response.statusText));
    }
}

// Create a generateOptions function to iterate through the dog breed JSON data array and insert as HTML <options> from the <select> parent
function generateOptions(data) {
    // Use map to iterate over array and return an option element from each item in the array, stored in the options variable
    // Use interpolation to insert each returned breed as the option and as text
    const options = data.map(item => `
        <option value='${item}'>${item} </option>
    `).join('');
    select.innerHTML = options;
}

// Create the generateImage function, takes the parameter 'data', assigned a template literal to take markup for image and paragraph
function generateImage(data) {
    const html = `
        <img src='${data}' alt>
        <p>Click to view images of ${select.value}s</p>
    `;
    // Set the inner HTML of the empty <div> with the 'card' class
    card.innerHTML = html;       
}

// To return a random image of a selected breed
function fetchBreedImage() {
    // To link breed from <select> menu to pass to fetchData breed randomiser
    const breed = select.value;
    // To be inserted into the card <div>
    const img = card.querySelector('img');
    const p = card.querySelector('p');

    // Function returns a promise that will be completed once a response is a returned from server and passed to JSON
    // Use string interpolation to insert the breed into the fetchData URL
    fetchData(`https://dog.ceo/api/breed/${breed}/images/random`)
        // Chain a method to update to a new image <url> and details returned 
        .then(data => {
            img.src = data.message; // sets to the URL if new random breed image
            img.alt = breed; // alt tag set to breed
            p.textContent = `Click to view more ${breed}s`; // update the paragraph text content to breed
        })
}

// ------------------------------------------
//  EVENT LISTENERS
// ------------------------------------------
// Call on select menu, a change event and the fetchBreedImage function as the callback
select.addEventListener('change', fetchBreedImage);
// Call on card menu, a click event will generate a new image, using fetchBreedImage as the callback
card.addEventListener('click', fetchBreedImage);
// Call on form menu, a submit event will generate a new POST, using postData as the callback
form.addEventListener('submit', postData);

// ------------------------------------------
//  POST DATA
// ------------------------------------------
// Using POST to pass additional data through the fetchData method
function postData(e) {
    e.preventDefault();
    // Targeting the name and comment in the <label for=> tags in the <form>
    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;

    const config = {
        method: 'POST', // indicates type of request
        headers: {
            'Content-Type': 'application/json' // usually contained within an object, specifies media type for JSON response, communicates to server data has been encoded with JSON
        },
        body: JSON.stringify({ name, comment }) // sent to server in the body of the response in a stringified JSON response
    }

    // Submit contents to JSON Placeholder API using fetch(), to send data to a server, call the POST method as the second parameter for object control with three keys: method, headers and body - contained in config variable
    fetch('https://jsonplaceholder.typicode.com/comments', config)
        .then(checkStatus)
        .then(res => res.json())
        // Console.logs on object with Comment text submitted if successful - the JSON Placeholder API sends submitted data back to us with an API, confirms test POST was successful
        .then(data => console.log(data))
}