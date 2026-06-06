import { useState } from "react"

function App() {
const [posts, setPosts] = useState([])
const [text, setText] = useState("")

const addPost = () => {
if (text.trim() === "") return

const newPost = {
text: text,
likes: 0
}

setPosts([newPost, ...posts])
setText("")
}

const deletePost = (indexToDelete) => {
const updated = posts.filter((_, index) => index !== indexToDelete)
setPosts(updated)
}

const likePost = (indexToLike) => {
const updated = posts.map((post, index) => {
if (index === indexToLike) {
return { ...post, likes: post.likes + 1 }
}
return post
})

setPosts(updated)
}

return (
<div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
<h1>Mini Social Network 🚀</h1>

<input
value={text}
onChange={(e) => setText(e.target.value)}
placeholder="დაწერე პოსტი..."
style={{
width: "100%",
padding: "10px",
marginBottom: "10px"
}}
/>

<button onClick={addPost} style={{ padding: "10px" }}>
Post
</button>

<div style={{ marginTop: "20px" }}>
{posts.map((post, index) => (
<div
key={index}
style={{
padding: "10px",
border: "1px solid gray",
marginTop: "10px"
}}
>
<p>{post.text}</p>

<p>❤️ Likes: {post.likes}</p>

<div style={{ display: "flex", gap: "10px" }}>
<button onClick={() => likePost(index)}>
Like
</button>

<button
onClick={() => deletePost(index)}
style={{ background: "red", color: "white" }}
>
Delete
</button>
</div>
</div>
))}
</div>
</div>
)
}

export default App