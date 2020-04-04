const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const {check, validationResult }= require('express-validator/check')
const Profile = require('../../models/Profile')
const User = require('../../models/Users')

//@route    GET api/profile/me
// @desc    Get current user profile
//@Access   Private  

router.get('/me',auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({msg: "No profile for this user"})
        }
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
    }
});


//@route    POST api/profile/
// @desc    Create or update user profile
//@Access   Private  

router.post('/', [auth, 
check('status', 'Status is required').not().isEmpty(),
check('skills', 'Skills is required').not().isEmpty()
], async (req, res)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error: errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin 
    } =req.body

    const profileFields ={};
    profileFields.user =req.user.id;

    if(company) profileFields.company= company;
    if(website) profileFields.website= website;
    if(location) profileFields.location= location;
    if(bio) profileFields.bio= bio;
    if(status) profileFields.status= status;
    if(githubusername) profileFields.githubusername= githubusername;
    if(skills){
        profileFields.skills=skills.split(',').map(skill=> skill.trim());
    }
    console.log(profileFields.skills)

    profileFields.social ={}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter= twitter;
    if(facebook) profileFields.social.facebook= facebook;
    if(instagram) profileFields.social.instagram= instagram;
    if(linkedin) profileFields.social.linkedin= linkedin;

    try {
        let profile= await Profile.findOne({user: req.user.id});
        // Update
        if(profile){
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
            return res.json(profile)
        }
        // Create
        profile= new Profile(profileFields);

        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send("Server error");
    }

    res.send(skills)
})

//@route    GET api/profile/
//@desc    Get all profiles
//@Access   public


router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

//@route    GET api/profile/user/:user_id
//@desc    Get all profile by user ID
//@Access   public


router.get('/user/:user_id', async (req, res) => {
    try {
      const profile = await Profile.findOne({
        user: req.params.user_id
      }).populate('user', ['name', 'avatar']);
  
      if (!profile) return res.status(400).json({ msg: 'Profile not found' });
  
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      if (err.kind == 'ObjectId') {
        return res.status(400).json({ msg: 'Profile not found' });
      }
      res.status(500).send('Server Error');
    }
  });


//@route    DELETE api/profile/
//@desc    Detete a user, profile and posts
//@Access   private


router.delete('/',auth,  async (req, res) => {
    try {
      await Profile.findOneAndRemove({user: req.user.id}) // remove profile
      await User.findOneAndRemove({_id: req.user.id}) // removes user
      res.json({msg: 'User removed '});
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


//@route    PUT api/profile/experience
//@desc    Add profile experience 
//@Access   private

router.put('/experience', [auth,
check('title','Title is required').not().isEmpty(),
check('company','Company is required').not().isEmpty(),
check('from','From date is required').not().isEmpty(),
], async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.satus(400).json({errors: errors.array()})
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;

      const newExp ={
        title,
        company,
        location,
        from,
        to,
        current,
        description
      }

      try {
          const profile =await Profile.findOne({user: req.user.id})
          profile.experience.unshift(newExp);
          await profile.save()

          res.json(profile)
      } catch (err) {
          console.error(err.message)
          res.status(500).send('Server Error')
      }
})

//@route    DELETE api/profile/experience/:exp_id
//@desc    Delete experince
//@Access   private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
    // rewrite same data except requested ID
      foundProfile.experience = foundProfile.experience.filter(
        exp => exp._id.toString() !== req.params.exp_id
      );
  
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });


module.exports= router;





/*   GET /profile/me  Get Logged in user profile

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk2NTQ3MiwiZXhwIjoxNTg2MzI1NDcyfQ.zYVzaQRP72ADbTnQXjddEQnPeJsbpoIErllsIcCI04U"\
 -X GET "http://localhost:5000/api/profile/me"

*/

/*   POST /profile/  Create profile

curl -d '{ "company" :"Marriott","website":"https://marriott.com/","location":"chennai","status":"Developer","skills":"Java, Python, react, HTML"}'  -H "Content-Type: application/json" -H "x-auth-token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4ODE0NTM0MGNmMzcwOThjNTY3MzViIn0sImlhdCI6MTU4NTk3NjQwNCwiZXhwIjoxNTg2MzM2NDA0fQ.COjLQj8GodselvU6nPB_-2yNwMlRNamJuHhesY-fvW8" -X POST "http://localhost:5000/api/profile"

*/

/*    GET /profile/  get all profiles
    curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk2NTQ3MiwiZXhwIjoxNTg2MzI1NDcyfQ.zYVzaQRP72ADbTnQXjddEQnPeJsbpoIErllsIcCI04U"\
 -X GET "http://localhost:5000/api/profile"
*/

/*   DELETE /profile/ delete user profile, posts 

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4ODE0MDM0MGNmMzcwOThjNTY3MzVhIn0sImlhdCI6MTU4NTk3NjMyNCwiZXhwIjoxNTg2MzM2MzI0fQ.grLttlYFsxU8Qt01Uuev_ls1ge-BpMo98dBfM44yayQ" \
-X DELETE "http://localhost:5000/api/profile"
*/

/*   PUT /profile/experience

curl -d '{  "title":"Dev at Inversa", "company":"Inversa", "location":"bangalore", "from":"8-7-2019", "current": true, "description": "Create apps" }' \
 -H "Content-Type: application/json" -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk4NDk3MywiZXhwIjoxNTg2MzQ0OTczfQ.K4gwiNHHGYimjLA8If5z2W0L86-WrB5Ns2dfkjNyG88" -X PUT "http://localhost:5000/api/profile/experience"

*/

/*   DELETE /profile/ delete user profile, posts 

curl -H "x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWU4NzIwYjhhMDEwNjYwYjFjNmZiOGM1In0sImlhdCI6MTU4NTk4NDk3MywiZXhwIjoxNTg2MzQ0OTczfQ.K4gwiNHHGYimjLA8If5z2W0L86-WrB5Ns2dfkjNyG88" \
-X DELETE "http://localhost:5000/api/profile/experience/5e8836a3cb91b517f0b00012"
*/