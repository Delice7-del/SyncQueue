# SyncQueue

### Always in Sync. Always in Order.

## Overview

This repository contains the frontend application for **SyncQueue**, an offline-first hospital queue management system designed to simulate real-world patient flow with high reliability and consistency.

The system is built with a strong focus on offline functionality, real-time simulation, and data synchronization, ensuring seamless operation even in unstable network conditions.

## The Problem

Hospitals and clinics often face:

- Overcrowded patient queues  
- Long and unpredictable waiting times  
- Lack of real-time queue visibility  
- Dependence on internet connectivity  

These challenges lead to inefficiencies, poor patient experience, and operational delays.

## How SyncQueue Solves It

- Enables patients to take queue tickets digitally  
- Provides real-time queue position and status updates  
- Works fully offline without internet dependency  
- Automatically syncs data when connection is restored  
- Simulates realistic hospital queue behavior using deterministic logic  

## Features

| Feature                | Description                                                   |
|----------------------|---------------------------------------------------------------|
| Ticket Generation     | Patients select a service and receive a unique queue ticket   |
| Multi-Service Queues  | Separate queues for Consultation, Lab, Pharmacy               |
| Wait Time Estimation  | Dynamic calculation based on queue length                     |
| Live Queue Simulation | Real-time-like updates without backend                        |
| Offline Mode          | Full functionality without internet                           |
| Auto Sync             | Syncs offline actions when back online                        |
| Queue Engine          | Deterministic queue logic and state transitions               |
| PWA Support           | Installable app with offline caching                          |
| Smooth UI             | Fast, responsive, and animated interface                      |

## Tech Stack

| Technology            | Purpose               |
|----------------------|-----------------------|
| Next.js (App Router) | Frontend Framework    |
| TypeScript           | Type Safety           |
| Tailwind CSS         | Styling               |
| Zustand              | State Management      |
| idb                  | IndexedDB Wrapper     |
| Framer Motion        | Animations            |
| Service Worker       | PWA Support           |
| Vercel               | Deployment            |

## How the System Works

1. User selects a service (Consultation, Lab, Pharmacy)  
2. System generates a unique ticket (e.g., CON-001)  
3. Queue position and wait time are calculated  
4. Queue engine simulates real-time movement  
5. Status updates: waiting → serving → done  
6. Offline actions are stored locally  
7. When online, pending actions are synced automatically  

## Pages

| Page            | Route              | Description                                  |
|-----------------|-------------------|----------------------------------------------|
| Home            | `/`               | Select service and generate ticket           |
| My Ticket       | `/my-ticket/[id]` | View ticket, status, and position            |
| Queue Dashboard | `/dashboard`      | View all queues and active patients          |

---

## Architecture Explanation

SyncQueue follows a layered architecture to ensure scalability, reliability, and separation of concerns.

- UI Layer: Built with Next.js and Tailwind CSS for responsive and modern interfaces  
- State Layer: Managed using Zustand for predictable and efficient state updates  
- Queue Engine: Handles ticket generation, queue ordering, and status transitions  
- Storage Layer: IndexedDB (via idb) ensures persistent, offline-capable data storage  
- Sync Engine: Processes offline actions and synchronizes them when connectivity is restored  
- Service Worker: Enables PWA functionality and caching for offline access  

This architecture ensures the system remains stable even under unstable network conditions.

---

## Offline Strategy

SyncQueue is designed as an offline-first application, meaning all core functionality works without internet.

### Key Principles

- All user actions are executed locally first  
- Data is stored in IndexedDB for persistence across refresh and restart  
- The app does not rely on a backend to function  

### Outbox Pattern

- Offline actions are stored in a queue (outbox)  
- When connectivity returns, queued actions are processed  
- Successful actions are removed  
- Failed actions are retried  

This guarantees no data loss and consistent system behavior.

---

## Caching Strategy

SyncQueue uses a Progressive Web App (PWA) caching strategy to ensure fast and reliable access.

### Approach

- Service Worker caches critical resources on first load  
- Subsequent visits load instantly, even offline  
- Data is refreshed in the background when online  

This improves performance and ensures continuous usability.

---

## State Management Approach

State is managed using **Zustand**, chosen for its simplicity and performance.

### Key Benefits

- Minimal boilerplate  
- Fine-grained state updates  
- Easy integration with async logic  
- Predictable state transitions  

This ensures a smooth and responsive user experience.

---

## Code Standards

- TypeScript only  
- Tailwind CSS only  
- Modular and reusable components  
- Clean and maintainable architecture  

## Available Scripts

- npm run dev  
- npm run build  
- npm run lint  
- npm run type-check  

## Deployment

Deployed on Vercel with automatic builds.

###

Link: syncqueue.vercel.app

---

Built with passion by **Delice Keza**  
Frontend Engineering Challenge · 2026
