package com.example.taskmanager.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.model.Task;

@Service
public class TaskService {

 private final TaskRepository repo;

 public TaskService(TaskRepository repo) {
  this.repo = repo;
 }

 public List<Task> getTasks(){
  return repo.findAll();
 }

 public Task addTask(Task task){
  return repo.save(task);
 }

 public void deleteTask(Long id){
  repo.deleteById(id);
 }

}