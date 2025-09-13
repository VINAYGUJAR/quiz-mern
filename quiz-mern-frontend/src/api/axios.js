import axios from "axios";

export default axios.create({
  baseURL:"https://quiz-mern-6oo1.onrender.com",
  withCredentials: true
});
