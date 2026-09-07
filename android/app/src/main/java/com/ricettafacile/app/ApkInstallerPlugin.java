package com.ricettafacile.app;

import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;

@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {

    @PluginMethod
    public void install(PluginCall call) {
        String filePath = call.getString("filePath");
        if (filePath == null || filePath.isEmpty()) {
            call.reject("filePath required");
            return;
        }
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                call.reject("File not found: " + filePath);
                return;
            }
            Uri uri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            if (getActivity() != null) {
                getActivity().startActivity(intent);
            } else {
                getContext().startActivity(intent);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Install error: " + e.getMessage());
        }
    }
}