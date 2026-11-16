package com.vortex.music;

import android.content.ComponentName;

import androidx.annotation.NonNull;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MediaMetadata;
import androidx.media3.common.Player;
import androidx.media3.session.MediaController;
import androidx.media3.session.SessionToken;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.MoreExecutors;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(
        name = "VortexPlayer"
)
public class VortexPlayerPlugin
        extends Plugin {

    private ListenableFuture<MediaController>
            controllerFuture;

    private MediaController controller;

    @Override
    public void load() {
        SessionToken token =
                new SessionToken(
                        getContext(),
                        new ComponentName(
                                getContext(),
                                VortexPlaybackService.class
                        )
                );

        controllerFuture =
                new MediaController.Builder(
                        getContext(),
                        token
                ).buildAsync();

        controllerFuture.addListener(
                () -> {
                    try {
                        controller =
                                controllerFuture.get();
                    } catch (Exception error) {
                        controller = null;
                    }
                },
                MoreExecutors.directExecutor()
        );
    }

    private boolean ready(
            PluginCall call
    ) {
        if (controller == null) {
            call.reject(
                    "Vortex player is not ready"
            );

            return false;
        }

        return true;
    }

    @PluginMethod
    public void setQueue(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        JSArray items =
                call.getArray(
                        "items",
                        new JSArray()
                );

        Integer startIndex =
                call.getInt(
                        "startIndex",
                        0
                );

        List<MediaItem> queue =
                new ArrayList<>();

        try {
            for (
                    int i = 0;
                    i < items.length();
                    i++
            ) {
                JSONObject source =
                        items.getJSONObject(i);

                String id =
                        source.optString(
                                "id",
                                ""
                        );

                String url =
                        source.optString(
                                "url",
                                ""
                        );

                String title =
                        source.optString(
                                "title",
                                ""
                        );

                String artist =
                        source.optString(
                                "artist",
                                ""
                        );

                String artwork =
                        source.optString(
                                "artwork",
                                ""
                        );

                if (
                        id.isEmpty() ||
                        url.isEmpty()
                ) {
                    continue;
                }

                MediaMetadata.Builder metadata =
                        new MediaMetadata.Builder()
                                .setTitle(title)
                                .setArtist(artist);

                if (!artwork.isEmpty()) {
                    metadata.setArtworkUri(
                            android.net.Uri.parse(
                                    artwork
                            )
                    );
                }

                MediaItem item =
                        new MediaItem.Builder()
                                .setMediaId(id)
                                .setUri(url)
                                .setMediaMetadata(
                                        metadata.build()
                                )
                                .build();

                queue.add(item);
            }

            if (queue.isEmpty()) {
                call.reject(
                        "Queue is empty"
                );

                return;
            }

            int safeIndex =
                    Math.max(
                            0,
                            Math.min(
                                    startIndex,
                                    queue.size() - 1
                            )
                    );

            controller.setMediaItems(
                    queue,
                    safeIndex,
                    0L
            );

            controller.prepare();

            call.resolve();

        } catch (Exception error) {
            call.reject(
                    "Unable to set queue",
                    error
            );
        }
    }

    @PluginMethod
    public void play(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        controller.play();
        call.resolve();
    }

    @PluginMethod
    public void pause(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        controller.pause();
        call.resolve();
    }

    @PluginMethod
    public void next(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        controller.seekToNextMediaItem();
        call.resolve();
    }

    @PluginMethod
    public void previous(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        if (
                controller.getCurrentPosition()
                        > 3000
        ) {
            controller.seekTo(0);
        } else {
            controller.seekToPreviousMediaItem();
        }

        call.resolve();
    }

    @PluginMethod
    public void seek(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        Double position =
                call.getDouble(
                        "position"
                );

        if (position == null) {
            call.reject(
                    "position is required"
            );

            return;
        }

        controller.seekTo(
                Math.max(
                        0L,
                        position.longValue()
                )
        );

        call.resolve();
    }

    @PluginMethod
    public void setShuffle(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        Boolean enabled =
                call.getBoolean(
                        "enabled",
                        false
                );

        controller.setShuffleModeEnabled(
                Boolean.TRUE.equals(
                        enabled
                )
        );

        call.resolve();
    }

    @PluginMethod
    public void setRepeat(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        String mode =
                call.getString(
                        "mode",
                        "off"
                );

        int mediaMode;

        switch (mode) {
            case "one":
                mediaMode =
                        Player.REPEAT_MODE_ONE;
                break;

            case "all":
                mediaMode =
                        Player.REPEAT_MODE_ALL;
                break;

            default:
                mediaMode =
                        Player.REPEAT_MODE_OFF;
        }

        controller.setRepeatMode(
                mediaMode
        );

        call.resolve();
    }

    @PluginMethod
    public void getState(
            PluginCall call
    ) {
        if (!ready(call)) {
            return;
        }

        JSObject state =
                new JSObject();

        state.put(
                "playing",
                controller.isPlaying()
        );

        state.put(
                "position",
                controller
                        .getCurrentPosition()
        );

        state.put(
                "duration",
                controller.getDuration()
        );

        state.put(
                "index",
                controller
                        .getCurrentMediaItemIndex()
        );

        MediaItem item =
                controller
                        .getCurrentMediaItem();

        state.put(
                "mediaId",
                item != null
                        ? item.mediaId
                        : ""
        );

        state.put(
                "shuffle",
                controller
                        .getShuffleModeEnabled()
        );

        state.put(
                "repeatMode",
                controller
                        .getRepeatMode()
        );

        call.resolve(
                state
        );
    }

    @Override
    protected void handleOnDestroy() {
        if (controller != null) {
            controller.release();
            controller = null;
        }

        if (
                controllerFuture != null
        ) {
            MediaController
                    .releaseFuture(
                            controllerFuture
                    );

            controllerFuture = null;
        }

        super.handleOnDestroy();
    }
}
