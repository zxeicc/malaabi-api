const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth")
const role =require("../middleware/role")
const fieldsController=require("../controllers/fieldsController")

// router.get('/fields',fieldsController.fields)

const { getFields, createField, updateField, deleteField } = require('../controllers/fieldsController');

router.get('/', getFields);
router.post('/', auth, role('admin',"owner"), createField);
router.put('/:id', auth, role('admin',"owner"), updateField);
router.delete('/:id', auth, role('admin',"owner"), deleteField);

module.exports =router;