package com.semo.backend.service;

import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.GraphHopper;
import com.graphhopper.ResponsePath;
import com.graphhopper.util.Parameters;
import com.graphhopper.util.PointList;
import com.semo.backend.dto.RoutingResponseDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class RoutingService {

    private final GraphHopper graphHopper;

    public RoutingService(GraphHopper graphHopper) {
        this.graphHopper = graphHopper;
    }

    public RoutingResponseDTO findShortestPath(double startLat, double startLng, double endLat, double endLng) {
        GHRequest req = new GHRequest(startLat, startLng, endLat, endLng)
                .setProfile("foot")
                // Explicitly use A* algorithm (Bidirectional A*)
                .setAlgorithm(Parameters.Algorithms.ASTAR_BI)
                .setLocale(Locale.US);
        
        GHResponse rsp = graphHopper.route(req);

        if (rsp.hasErrors()) {
            throw new RuntimeException("Routing error: " + rsp.getErrors().get(0).getMessage());
        }

        ResponsePath path = rsp.getBest();
        
        double distance = path.getDistance();
        long timeInMs = path.getTime();
        
        PointList pointList = path.getPoints();
        List<double[]> points = new ArrayList<>();
        for (int i = 0; i < pointList.size(); i++) {
            points.add(new double[]{pointList.getLat(i), pointList.getLon(i)});
        }
        
        return new RoutingResponseDTO(distance, timeInMs, points);
    }
}
