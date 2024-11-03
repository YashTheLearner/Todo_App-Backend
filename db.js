const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User = new Schema({
    name: {type:String, required: true},
    email: {type:String, unique: true, required: true},
    password: {type:String, required: true},
});

const Todos = new Schema({
    UserId: ObjectId,
    task: String,
    isChecked: {type: Boolean, default: false},
});

const UserModel = mongoose.model('User', User);
const TodosModel = mongoose.model('Todos', Todos);

module.exports = {
    UserModel: UserModel,
    TodosModel: TodosModel
};