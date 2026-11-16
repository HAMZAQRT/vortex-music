package com.vortex.music;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity
        extends BridgeActivity {

    @Override
    public void onCreate(
            Bundle savedInstanceState
    ) {
        registerPlugin(
                VortexPlayerPlugin.class
        );

        super.onCreate(
                savedInstanceState
        );
    }
}
