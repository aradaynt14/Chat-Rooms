package com.example.webchatserver;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashSet;
import java.util.Set;

//
@WebServlet(name = "roomServlet", value = "/room-list")
public class RoomList extends HttpServlet {

    public static Set<String> rooms = new HashSet<>();
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        rooms.add(request.getReader().readLine());
    }
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/plain");

        // send the random code as the response's content
        PrintWriter out = response.getWriter();
        for (String room : rooms){
            out.println(room);
        }
    }
}
