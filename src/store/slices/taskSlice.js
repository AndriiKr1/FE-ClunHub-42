import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axiosConfig";
import { formatDateForApi } from "../../utils/dataMappers";

// Утиліти для сортування та організації завдань
const sortTasksByDate = (tasks) => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.deadline || a.completionDate || 0);
    const dateB = new Date(b.deadline || b.completionDate || 0);
    return dateB - dateA;
  });
};

const organizeTasksByDate = (tasks) => {
  return tasks.reduce((acc, task) => {
    let dateKey;

    // Для виконаних завдань пріоритетним є completionDate
    if (task.status === "COMPLETED" || task.completed) {
      dateKey = (
        task.completionDate ||
        task.deadline ||
        new Date().toISOString()
      ).split("T")[0];
    }
    // Для активних завдань використовуємо deadline
    else if (task.deadline) {
      dateKey = task.deadline.split("T")[0];
    }

    if (dateKey) {
      // Якщо такої дати ще немає в акумуляторі, створюємо порожній масив
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      // Додаємо завдання до масиву для цієї дати
      acc[dateKey].push(task);
    }

    return acc;
  }, {});
};

// Створення завдання
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue, dispatch }) => {
    try {
      // Валідація даних
      if (!taskData.name || taskData.name.length < 1) {
        return rejectWithValue(
          "The task name must be at least 1 characters long."
        );
      }

      if (taskData.name.length > 30) {
        return rejectWithValue("The task name cannot exceed 30 characters.");
      }

      // Перевірка дати
      const formattedDate = taskData.deadline
        ? formatDateForApi(taskData.deadline)
        : null;

      if (!formattedDate) {
        return rejectWithValue("Due date is required");
      }

      // Підготовка даних для запиту
      const taskRequest = {
        title: taskData.name,
        description: taskData.description || "",
        dueDate: formattedDate,
        status: "IN_PROGRESS",
        priority: taskData.priority || 3,
      };

      // Надсилання запиту
      const response = await axios.post("/api/tasks", taskRequest);

      // Оновлення списку завдань
      await dispatch(fetchTasks()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create task"
      );
    }
  }
);

// Оновлення завдання
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, taskData, email }, { rejectWithValue, dispatch }) => {
    try {
      // Валідація даних
      if (!taskData.name || taskData.name.length < 1) {
        return rejectWithValue(
          "The task name must be at least 1 characters long"
        );
      }

      if (taskData.name.length > 30) {
        return rejectWithValue("The task name cannot exceed 30 characters");
      }

      // Форматування дати
      const formattedDate = taskData.deadline
        ? formatDateForApi(taskData.deadline)
        : null;

      const updateRequest = {
        title: taskData.name,
        description: taskData.description || "",
        dueDate: formattedDate,
      };

      const response = await axios.put(
        `/api/tasks?taskId=${taskId}&email=${email}`,
        updateRequest
      );

      // Оновлення списку завдань
      await dispatch(fetchTasks()).unwrap();

      return response.data;
    } catch (error) {
      console.error("Task update error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task"
      );
    }
  }
);

// Отримання завдань
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params, { rejectWithValue }) => {
    try {
      const { fromDate, toDate, includeCompleted = false } = params || {};

      // Формируем URL с параметрами, если они предоставлены
      let url = `/api/tasks/list`;
      const queryParams = [];
      
      if (fromDate) queryParams.push(`fromDate=${fromDate}`);
      if (toDate) queryParams.push(`toDate=${toDate}`);
      if (includeCompleted !== undefined) queryParams.push(`includeCompleted=${includeCompleted}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      

      const response = await axios.get(url);

      // Map the response data to a consistent format
      const mappedTasks = (response.data || [])
        .filter((task) => task)
        .map((task) => ({
          id: task.id,
          name: task.title || task.name,
          description: task.description,
          deadline: task.dueDate,
          status: task.status,
          completed: task.completed || task.status === "COMPLETED",
          createdAt: task.createdAt,
          completionDate: task.completionDate,
        }));

      return mappedTasks;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

// Оновлення статусу завдання
export const updateTaskStatus = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      // Create today's date in the correct format
      const now = new Date();
      const today = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      const response = await axios.patch(
        `/api/tasks/${id}/status?status=${status}`
      );

      // After successful API call, get all tasks including completed ones
      setTimeout(async () => {
        await dispatch(fetchTasks({ 
          includeCompleted: true 
        })).unwrap();
      }, 300);

      return {
        ...response.data,
        id,
        status,
        completionDate: status === "COMPLETED" ? today : null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task status"
      );
    }
  }
);
// Видалення завдання
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`/api/tasks?id=${taskId}`);

      // Оновлення списку завдань
      setTimeout(async () => {
        await dispatch(
          fetchTasks({
            includeCompleted: false,
          })
        ).unwrap();
      }, 300);

      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task"
      );
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    tasksByDate: {},
    loading: false,
    error: null,
    totalElements: 0,
    totalPages: 0,
    page: 0,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;

        // Map and filter tasks
        const mappedTasks = action.payload || [];

        // Store tasks sorted by date
        state.tasks = sortTasksByDate(mappedTasks);

        // Create organized task map by date
        state.tasksByDate = organizeTasksByDate(mappedTasks);
      })

      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
      
        // Find and update the task in the tasks array
        const taskId = action.payload.id;
        const newStatus = action.payload.status;
        const completionDate = action.payload.completionDate;
        
        const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
        
        if (taskIndex !== -1) {
          // If we found the task, update it with new data
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            status: newStatus,
            completed: newStatus === "COMPLETED",
            completionDate: newStatus === "COMPLETED" ? completionDate : null
          };
          
          // Rebuild tasksByDate from the updated tasks array 
          // instead of manually manipulating it to avoid inconsistencies
          state.tasksByDate = organizeTasksByDate(state.tasks);
        }
      })
    
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteTask reducers
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        
        // Get the deleted task ID
        const taskId = action.payload;
        
        // Remove from tasks array
        state.tasks = state.tasks.filter(task => task.id !== taskId);
        
        // Rebuild tasksByDate from the updated tasks array
        state.tasksByDate = organizeTasksByDate(state.tasks);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createTask reducers - add explicit handling
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTask reducers - add explicit handling
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
