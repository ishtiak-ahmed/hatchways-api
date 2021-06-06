
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const app = express()
app.use(cors())
const port = 3000

async function fetchData(tag) {
    const url = `https://api.hatchways.io/assessment/blog/posts?tag=${tag}`
    const post = await fetch(url)
        .then(res => res.json())
        .catch(err => console.log(err))
    return post.posts;
}

async function getPosts(arr) {
    let allPosts = []
    for (let i = 0; i < arr.length; i++) {
        const post = await fetchData(arr[i])
        allPosts = [...allPosts, ...post]
    }
    return allPosts
}

const removeDuplicate = (arr) => {
    let obj = {};
    const len = arr.length;
    for (let i = 0; i < len; i++)
        obj[arr[i]['id']] = arr[i];
    let newArr = new Array();
    for (let key in obj)
        newArr.push(obj[key]);
    return newArr;
}


app.get('/blog/ping', (req, res) => {
    res.status(200).send({ success: true })
})

app.get('/blog/posts', async (req, res) => {
    const tags = (req.query.tags.split(','));
    const sortBy = req.query.sortBy
    const direction = req.query.direction || 'asc'
    let allPosts = await getPosts(tags)
    const uniquePosts = removeDuplicate(allPosts)
    res.send(uniquePosts.sort((a, b) => {
        return (direction === 'dsc' ? (b[sortBy] - a[sortBy]) : (a[sortBy] - b[sortBy]))
    }))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})