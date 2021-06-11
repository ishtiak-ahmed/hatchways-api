const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const app = express()
app.use(cors())
const port = 4000

// Loop through all tags
function getPosts(arr) {
    const urls = arr.map(tag => {
        const url = `https://api.hatchways.io/assessment/blog/posts?tag=${tag}`
        return url
    })
    return Promise.all(urls.map(u => fetch(u))).then(responses =>
        Promise.all(responses.map(res => res.json())).then(data => {
            const arraysOfPosts = (data.map(post => post.posts))
            const merged = [].concat.apply([], arraysOfPosts)
            return merged;
        })
    )
}

// Remove Duplicate Post
const removeDuplicate = (arr) => {
    const obj = {};
    arr.forEach(item => obj[item['id']] = item);
    return Object.values(obj)
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
        const allPosts = await getPosts(tags)
        const uniquePosts = removeDuplicate(allPosts)
        const sortedPosts = uniquePosts.sort((a, b) => {
            return (direction === 'desc' ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy]))
        })
        res.status(200).send({ posts: sortedPosts })
    }
})

app.listen(port)