const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const app = express()
app.use(cors())
const port = 4000

// To fetch data from original API
async function fetchData(tag) {
    const url = `https://api.hatchways.io/assessment/blog/posts?tag=${tag}`
    const post = await fetch(url)
        .then(res => res.json())
        .catch(err => console.log(err))
    return post.posts;
}

// Loop through all tags
async function getPosts(arr) {
    let allPosts = []
    for (let i = 0; i < arr.length; i++) {
        const post = await fetchData(arr[i])
        allPosts = [...allPosts, ...post]
    }
    return allPosts
}

// Remove Duplicate Post
const removeDuplicate = (arr) => {
    let obj = {};
    arr.forEach(item => obj[item['id']] = item);
    let newArr = Object.values(obj)
    return newArr;
}

// Route 1
app.get('/api/ping', (req, res) => {
    res.status(200).send({ success: true })
})

// Route 2 with Query Data
app.get('/api/posts', async (req, res) => {
    if (!req.query.tags) {
        res.status(400).send({ "error": "Tags parameter is required" })
    } else {
        const acceptableSortValue = ['id', 'likes', 'reads', 'popularity', undefined]
        const directionValues = ['desc', 'asc']
        const tags = (req.query.tags.split(','));
        const sortBy = req.query.sortBy
        const direction = req.query.direction || 'asc'
        if (
            acceptableSortValue.indexOf(sortBy) < 0 ||
            directionValues.indexOf(direction) < 0) {
            res.status(400).send({ "error": "sortBy parameter is invalid" })
        }
        let allPosts = await getPosts(tags)
        const uniquePosts = removeDuplicate(allPosts)
        const posts = uniquePosts.sort((a, b) => {
            return (direction === 'desc' ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy]))
        })
        res.status(200).send({ posts: posts })
    }
})

app.listen(port)