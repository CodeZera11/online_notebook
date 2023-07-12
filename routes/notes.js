const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');


// Route-1: Fetch all notes of User using: GET '/api/notes/fetchallnotes'. Login Required
router.get('/fetchallnotes', fetchuser ,async(req,res)=>{
    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
});

// Route-2: Adding a note using: POST '/api/notes/addnote'. Login Required
router.post('/addnote', fetchuser ,[
    body('title', 'Enter a valid title').isLength({min: 3}),
    body('description', 'Enter a valid description').isLength({min: 5})
] ,async(req,res)=>{

    try {
        // If errors then return bad request and return the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    let {title, description, tag} = req.body;

    const note = new Note({
        title, description, tag, user: req.user.id
    })

    const savednote = await note.save();

    res.json(savednote);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }

});

// Route-3: Updating a existing note using: PUT '/api/notes/updatenote'. Login Required
router.put('/updatenote/:id', fetchuser, async(req,res)=>{

    try {
        let {title, description, tag} = req.body;

        let newNote = {};

        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        let note = await Note.findById(req.params.id);

        if(!note){
            res.status(404).send("Not Found!!!!!!");
        }

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed!!!")
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})

        res.json(note)
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
    
});

// Route-4: Deleting a existing note using: DELETE '/api/notes/updatenote'. Login Required
router.delete('/deletenote/:id', fetchuser, async (req,res)=>{
    try {
        let note = await Note.findById(req.params.id);
        // console.log(note)
        if(!note){
            return res.status(404).send("Not Found!!");
        }

        if(note.user.toString() !== req.user.id){
            return res.status(400).send("Not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);

        return res.status(200).send("Note deleted successfully");

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal Error"})
    }

});

module.exports = router