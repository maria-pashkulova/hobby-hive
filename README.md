# Hobby Hive

## About
Hobby Hive is a web-based application in which users can find and join groups with similar interests and hobbies, plan events together, create posts about their favourite activities and chat in group rooms. The platform aims to encourage interest-based group events that take place live in Bulgaria.

## Application structure

### Public Part
1. Login and Register pages.
* Users can sign up / in using an email and password as their credentials
  
### Private Part
1. Update profile page
* Users can edit their personal information, login credentials and upload profile picture

2. Home page listing hobby groups
-	Pagination included
-	Users can search for a group by name and filter groups by group hobby category and main location (all regional cities in Bulgaria)

3. My Groups page
-	Pagination included
-	List of all groups the user is member of

4. Group rooms  
In a single group page all group’s posts, events and chat are available. There are two member roles in a group – group administrator (the creator of the group) and normal user. Users who are not members of the group can only view group’s details (its name, description, location, hobby category, members of the group) and group’s posts. If a user joins a group he can access group’s events calendar, group chat and can add other users to the group. Users can leave groups and group administrators can remove other users from member list.
  * Group posts  
    Members can create, edit and delete (their own) posts. Infinite scroll implemented
    
  * Group events  
Group events are displayed in a calendar component (FullCalendar) with different colors - а convenient interface for creating and viewing events.  
Each group member can create an event suggestion and other users can mark themselves as going / not going. Event data – specific location where it will take place and dates are validated upon creation. Group administrator can update, delete group events and  receive requests for events details change from other group members. Each member (who is not the event creator and group administrator ) can create a request with description for the group event change he wants to suggest (for example reporting insufficient/ inaccurate information about an event).
 
5. My Calendar  
Includes all events (from different groups) for which the current logged in user has marked himself as going.

***All group members who are logged in receive notifications for new events and new messages in the groups they members of. Group administrators receive notifications for event change requests.***  
***File storage cloud API usage - All images are uploaded in Cloudinary***

## Developed with
* Front-End : React , Chakra UI , FullCalendar
* Back-End : Express, Node.js, MongoDB, Mongoose ODM
* Real-time communication: Socket.io

## Project structure
* Client application is in the ‘client’ folder
* Server application (RESTful server) is in the ‘server’ folder.

## How to run the project

.env file with the following setup must be placed directly in the root of the ‘server’ folder

```
PORT=...
DB_CONNECTION_STRING=...
ACCESS_TOKEN_SECRET=...
COOKIE_NAME=token
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
