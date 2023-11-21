let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selectedRover: undefined,
    currentData: undefined
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const renderMenu = (rovers) => {
    return `<ul class="flex">${renderButtonState(rovers)}</ul>`
}

const handleClick = (event) => {
    const id = event.currentTarget.id;
    updateStore(store, { selectedRover: id })
    getRoverByName(store)
}

const renderButtonState = (rovers) => {
    return Array.from(rovers).map(item =>
        `<li id=${item} class="flex-item btn" onclick="handleClick(event)">
             <a ref="#"  class=""  >${item?.toUpperCase()}</a>
         </li>`
    ).join("")
}


const renderContent = (state) => {
    const { selectedRover, user } = state

    if (!selectedRover) return Greeting(user.name)
    const { currentData } = store
    const { latest_photos } = currentData
    console.log(latest_photos)
    return latest_photos?.map(photo => {
        const { img_src, rover, earth_date } = photo
        return Rover({ img_src, rover, earth_date })
    }).join("")
}

// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header>
            <div class="banner">
            <h1 class="banner-text">Discover Mars Rovers</h1>
            ${ImageOfTheDay(apod)}
            </div>
        </header>
        
        <main class="main">
            <div class="wrapper-buttons">	
                <div class="button-container">${renderMenu(rovers)}</div>
                </div>
            </div>
            <div>
                ${renderContent(state)}
            </div>
        </main>
        
        <footer>
            <h6>
                by <a href="https://api.nasa.gov/">NASA</a>.
            </h6>
        </footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Rover = ({ img_src, rover, earth_date }) => {
    return `<div class="rover-content">
        <img class="rover-image" src=${img_src}>
        <p><span>Image date:</span> ${earth_date}</p>
        <p><span>Rover:</span> ${rover.name}</p>
        <p><span>State of the rover:</span> ${rover.status}</p>
        <p><span>Launch date:</span> ${rover.launch_date}</p>
        <p><span>Landing date:</span> ${rover.landing_date}</p>
        <br>
    </div>`
}

const Greeting = (name) => {
    if (name) {
        return `<h1>Welcome, ${name}!</h1>`
    }

    return `<h1>Hello!</h1>`
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
        <div class="image-container">
            <img src="${apod.image.url}" />
        </div>
        `)
    }
}

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = async (state) => {
    const { apod } = state

    const data = await fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return data
}

const getRoverByName = async (state) => {
    const { selectedRover } = state
    await fetch(`http://localhost:3000/rovers/${selectedRover}`)
        .then(res => res.json()).then(data => updateStore(store, { currentData: data }))

}
