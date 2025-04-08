package com.example.webchatserver;


import jakarta.servlet.annotation.WebServlet;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;

import java.io.IOException;
import java.util.*;

import com.vdurmont.emoji.EmojiParser;


/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users
    private static ArrayList<ChatRoom> roomList = new ArrayList<>();
    // you may add other attributes as you see fit
    private Map<String, String> usernames = new HashMap<String, String>();

    public static List<ChatRoom> getRoomList() {
        return roomList;
    }


    @OnOpen
    public void open(@PathParam("roomID") String roomID, Session session) throws IOException, EncodeException {
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to the chat room. Please state your username to begin.\"}");
        roomList.add(new ChatRoom(roomID, session.getId()));

        String userId = session.getId();
        for (ChatRoom room : roomList) {
            if (room.getCode().equals(roomID)) {
                room.setuserRoom(roomID, userId);
                break;
            }
        }

    }

    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();
        //check for usernames with associated id
        if (usernames.containsKey(userId)) {
            String username = usernames.get(userId);
            usernames.remove(userId); //remove user from usernames
            String roomID = null;
            for (ChatRoom room : roomList) {
                //checks which room the user is from in roomList hashmap
                if (room.getUsers().containsKey(userId)) {
                    roomID = room.getCode(); //get code for that room
                    room.removeUser(userId); //remove user from room element from roomList
                    break;
                }
            }
            if(roomID!=null) {
                for (Iterator<ChatRoom> iterator = roomList.iterator(); iterator.hasNext(); ) {
                    ChatRoom room = iterator.next();
                    if(room.getCode().equals(roomID)){
                        iterator.remove();
                        //broadcast this person left the server
                        for (Session peer : session.getOpenSessions()) {
                            if (room.inRoom(peer.getId())) { // Check room ID
                                peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room.\"}");
                            }
                        }
                    }
                }
            }
        }
    }

    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {
        String userID = session.getId();
        ChatRoom userRoom = null;

        // Find the room associated with the current user's session
        for (ChatRoom room : roomList) {
            if (room.getUsers().containsKey(userID)) {
                userRoom = room;
                break;
            }
        }

        if (userRoom != null) {
            JSONObject jsonmsg = new JSONObject(comm);
            String type = (String) jsonmsg.get("type");
            String message = (String) jsonmsg.get("msg");

            // Parse emoji shortcuts into actual emoji characters
            String parsedMessage = EmojiParser.parseToUnicode(message);

            // Handle the message
            // existing user
            if (usernames.containsKey(userID)) {
                String username = usernames.get(userID);
                if (username != null) {
                    for (Session peerSession : session.getOpenSessions()) {
                        String peerID = peerSession.getId();
                        if (userRoom.getUsers().containsKey(peerID)) {
                            peerSession.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + "): " + parsedMessage + "\"}");
                        }
                    }
                }
            } else { // new user
                session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome, " + parsedMessage + "!\"}");
                usernames.put(userID, parsedMessage);
                for (Map.Entry<String, String> entry : userRoom.getUsers().entrySet()) {
                    String peerID = entry.getKey();
                    for (Session peerSession : session.getOpenSessions()) {
                        if (peerSession.getId().equals(peerID)) {
                            if (!peerID.equals(userID)) {
                                peerSession.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + parsedMessage + " joined the chat room.\"}");
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}