import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createTask, updateTask } from "../../store/slices/taskSlice";
import styles from "./AddTask.module.css";
import ProfileHeader from "../ProfileHeader/ProfileHeader";
import leftIcon from "../../assets/images/left.png";
import checkmarkIcon from "../../assets/images/checkmark1.png";

const AddTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch(); 
  const { user } = useSelector((state) => state.auth);

  const { taskToEdit, isEditing } = location.state || {};

  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({
    taskName: "",
    deadline: "",
    description: ""
  });

  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTaskName(taskToEdit.name);
      
     
      if (taskToEdit.deadline) {
        // Переконуємось, що формат дати YYYY-MM-DD
        const dateValue = typeof taskToEdit.deadline === 'string' 
          ? taskToEdit.deadline.split('T')[0] 
          : taskToEdit.deadline;
        setDeadline(dateValue);
      }
      
      setDescription(taskToEdit.description || "");
    }
  }, [isEditing, taskToEdit]);

  const handleBack = () => navigate('/dashboard');
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      taskName: '',
      deadline: '',
      description: ''
    };
    
    if (!taskName.trim()) {
      newErrors.taskName = 'Please enter task name';
    } else if (taskName.length > 30) {
      newErrors.taskName = 'Task name cannot exceed 30 characters';
    }
    
    // Проверка на прошедшую дату
    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!deadline) {
      newErrors.deadline = 'Please select deadline';
    } else if (selectedDate < today) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }
    
    if (description && description.length > 100) {
      newErrors.description = 'Description cannot exceed 100 characters';
    }
    
    setErrors(newErrors);
    
    if (newErrors.taskName || newErrors.deadline || newErrors.description) {
      return;
    }
    
    try {
      if (isEditing && taskToEdit) {
        await dispatch(updateTask({
          taskId: taskToEdit.id,
          taskData: {
            name: taskName,
            description,
            deadline
          },
          email: user.email
        })).unwrap();
      } else {
        await dispatch(createTask({
          name: taskName,
          description,
          deadline
        })).unwrap();
      }
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving task:', error);
      setErrors({
        submit: error
      });
    }
  };

  const handleOk = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.addTaskContainer}>
      <ProfileHeader />

      <div className={styles.contentWrapper}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => {
            setTaskName(e.target.value);
            setErrors({ ...errors, taskName: "" });
          }}
          placeholder={isEditing ? "Edit task name" : "Enter task name"}
          className={`${styles.taskTitleInput} ${
            errors.taskName ? styles.errorInput : ""
          }`}
        />
        {errors.taskName && (
          <p className={styles.errorMessage}>{errors.taskName}</p>
        )}

        <form onSubmit={handleSubmit} className={styles.taskForm} noValidate>
          <div className={styles.deadlineContainer}>
            <span className={styles.deadlineLabel}>Deadline:</span>
            <input
              type="date"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setErrors({ ...errors, deadline: "" });
              }}
              className={`${styles.dateInput} ${
                errors.deadline ? styles.errorInput : ""
              }`}
              min={today}
            />
            {errors.deadline && (
              <p className={styles.errorMessage}>{errors.deadline}</p>
            )}
          </div>

          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors({ ...errors, description: "" });
            }}
            placeholder="Enter task description..."
            className={`${styles.descriptionInput} ${
              errors.description ? styles.errorInput : ""
            }`}
            rows={6}
          />
          {errors.description && (
            <p className={styles.errorMessage}>{errors.description}</p>
          )}

          <div className={styles.actionButtonsContainer}>
            <div className={styles.actionButtons}>
              <img
                src={leftIcon}
                alt="back"
                onClick={handleBack}
                className={styles.leftIcon}
              />
              <button type="submit" className={styles.submitButton}>
                <img
                  src={checkmarkIcon}
                  alt={isEditing ? "save changes" : "save"}
                  className={styles.checkmarkIcon}
                />
              </button>
            </div>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className={styles.successPopup}>
          <div className={styles.popupContent}>
            <p>
              Task "{taskName}" {isEditing ? "updated" : "added"} successfully!
            </p>
            <button className={styles.okButton} onClick={handleOk}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className={styles.footer}>family planner</div>
    </div>
  );
};

export default AddTask;
