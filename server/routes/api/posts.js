const express = require('express');
const router = express.Router();
const auth= require('../../middleware/auth')
const {check, validationResult }= require('express-validator/check')
const Profile = require('../../models/Profile')
const User = require('../../models/Users')
const Post =require('../../models/Post')

//@route    POST api/posts
// @desc    Create a Post
//@Access   Private 

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

//@route    GET api/posts
// @desc    Get all post
//@Access   Private

router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 });
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


//@route    GET api/posts/:id
// @desc    Get post by ID
//@Access   Private 

router.get('/:id',auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({msg: "post not found"})
        res.json(post)
    } catch (err) {
        if(err.kind === 'ObjectId') return res.status(404).json({msg: "post not found"})
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check for ObjectId format and post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check user
      if (post.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post not liked' });
    }

    const removeIndex =post.likes.map(like => like.user.toString()).indexOf(req.user.id)
    post.likes.splice(removeIndex, 1)

    await post.save();
    res.json(post.likes)

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post('/comment/:id',[ auth,
    [  check('text', 'Text is required').not().isEmpty() ]
  ],  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
});
module.exports= router;


/*  POST /posts/  CREATE post

curl -d '{ "text" :"I am a Bengaluru based Systems Engineer. I have programming and interpersonal skills, with the proactive, optimistic attitude and agility to learn new things with enthusiasm.."}' \
-H "Content-Type: application/json" -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NjAwMzAyOSwiZXhwIjoxNTg2MzYzMDI5fQ.PS7Fn6ne_ULuI9xaM139PzDY32g0hW7YCRaorS7mZW0" -X POST "http://localhost:5000/api/posts"
*/

/*  GET /posts/  GET posts
curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4ODE0NTM0MGNmMzcwOThjNTY3MzViIn0sImlhdCI6MTU4NTk3NjQwNCwiZXhwIjoxNTg2MzM2NDA0fQ.COjLQj8GodselvU6nPB_-2yNwMlRNamJuHhesY-fvW8"\
 -X GET "http://localhost:5000/api/posts"

*/
/*   DELETE /profile/posts/:id delete user profile, posts 

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NjAwMzAyOSwiZXhwIjoxNTg2MzYzMDI5fQ.PS7Fn6ne_ULuI9xaM139PzDY32g0hW7YCRaorS7mZW0" \
-X DELETE "http://localhost:5000/api/posts/5e887e50ffa30f15a0a83650"
*/

/*   PUT /profile/posts/like/:id Like Post

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk4NDk3MywiZXhwIjoxNTg2MzQ0OTczfQ.K4gwiNHHGYimjLA8If5z2W0L86-WrB5Ns2dfkjNyG88" -X PUT "http://localhost:5000/api/posts/like/5e886c972bc50c07742a6680"

*/

/*   PUT /profile/posts/unlike/"id" Like Post

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk4NDk3MywiZXhwIjoxNTg2MzQ0OTczfQ.K4gwiNHHGYimjLA8If5z2W0L86-WrB5Ns2dfkjNyG88" -X PUT "http://localhost:5000/api/posts/unlike/5e886c972bc50c07742a6680"

*/

/*  POST api/posts/comment/:id  CREATE comment

curl -d '{ "text" :"Good post"}' \
-H "Content-Type: application/json" -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NjAwMzAyOSwiZXhwIjoxNTg2MzYzMDI5fQ.PS7Fn6ne_ULuI9xaM139PzDY32g0hW7YCRaorS7mZW0" -X POST "http://localhost:5000/api/posts/comment/5e886c972bc50c07742a6680"
*/

/*   DELETE /comment/:id/:comment_id delete comment

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NjAwMzAyOSwiZXhwIjoxNTg2MzYzMDI5fQ.PS7Fn6ne_ULuI9xaM139PzDY32g0hW7YCRaorS7mZW0" \
-X DELETE "http://localhost:5000/api/posts/comment/5e886c972bc50c07742a6680/5e888808e33af015641b9a2a"
*/


