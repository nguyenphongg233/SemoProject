package com.semo.backend.config;

import com.graphhopper.GraphHopper;
import com.graphhopper.config.Profile;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class GraphHopperConfig {

    @Bean
    public GraphHopper graphHopper() {
        GraphHopper hopper = new GraphHopper();
        
        String basePath = "";
        File dataDir = new File("data");
        if (!dataDir.exists() && new File("backend/data").exists()) {
            basePath = "backend/";
        }

        String osmFilePath = basePath + "data/vietnam-latest.osm.pbf";
        String ghCachePath = basePath + "data/vietnam-gh";

        hopper.setOSMFile(osmFilePath);
        hopper.setGraphHopperLocation(ghCachePath);
        
        // Configure profile for users walking to the scooter
        com.graphhopper.util.CustomModel footModel = new com.graphhopper.util.CustomModel();
        footModel.addToSpeed(com.graphhopper.json.Statement.If("true", com.graphhopper.json.Statement.Op.LIMIT, "5"));
        hopper.setProfiles(new Profile("foot").setCustomModel(footModel));
        
        // Disable Contraction Hierarchies (CH) to allow standard A* routing
        hopper.getCHPreparationHandler().setCHProfiles();
        
        File osmFile = new File(osmFilePath);
        if (osmFile.exists()) {
            System.out.println("Importing/Loading GraphHopper map from: " + osmFile.getAbsolutePath() + " (This may take a few minutes)...");
            hopper.importOrLoad();
            System.out.println("GraphHopper loaded successfully.");
        } else {
            System.err.println("WARNING: OSM data file not found at " + osmFile.getAbsolutePath() + ". GraphHopper will not start properly.");
        }
        
        return hopper;
    }
}
