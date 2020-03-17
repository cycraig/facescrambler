# OpenCV Face Scrambler

I wrote this because the official examples of using OpenCV WebAssembly (Wasm) were pretty lacklustre. OpenCV Wasm does not support the full suite of OpenCV functions (good luck figuring out exactly what does and does not work though).

### Start Webserver

Wasm files cannot be loaded locally, so we need to run a web server (basically any web server will do).

Python 3:
```
python -m http.server
```

Python 2.7:
```
python -m SimpleHTTPServer
```

### Installation from Scratch

The pre-compiled OpenCV wasm file is included in this repository. The following is required only if you want to compile the latest version of OpenCV to WebAssembly yourself. The steps here are based on the official OpenCV documentation: https://docs.opencv.org/4.1.1/d4/da1/tutorial_js_setup.html

Preqrequisites:

- cmake
- C compiler (gcc)
- C++11 compiler (g++)
- Python (2.7 or 3+)

Requirements:

- Emscripten with Binaryren
- OpenCV WebAssembly
- wasm-opt [optional]

#### Install Emscripten with Binaryren

Emscripten is a toolchain for compiling to WebAssembly, built using LLVM.

https://webassembly.org/getting-started/developers-guide/

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install --build=Release sdk-incoming-64bit binaryen-master-64bit
./emsdk activate --build=Release sdk-incoming-64bit binaryen-master-64bit
```

Note: you must use the above flags, Binaryren is not included by default.

#### Build OpenCV WebAssembly

Ensure the Emscripten environment variable is setup correctly:

```
source ./emsdk_env.sh
echo ${EMSCRIPTEN}
```

If the EMSCRIPTEN variable is blank, the Emscripten compilation failed or you may not have built the Binaryren target specified in the previous step.

Download a release version of the OpenCV soutce code (https://opencv.org/releases/) or the latest version from Github:

```
git clone https://github.com/opencv/opencv.git
cd opencv
python ./platforms/js/build_js.py build_wasm --build_wasm
```

The latest version of Emscripten automatically enables pthread support, which can cause the build to fail. If you encounter `shared:ERROR: If pthreads and memory growth are enabled, WASM_MEM_MAX must be set`, add `flags += "-s USE_PTHREADS=0 "` to the `get_build_flags` function in `build_js.py`. See https://github.com/opencv/opencv/issues/14691 for more information.

#### [optional] Install wasm-opt 

Binaryren includes `wasm-opt`, a useful tool for optimising the size and/or performance of your WebAssembly files. If you built Emscripten yourself it is included under "emsdk/binaryen/master_64bit_binaryen/bin", but Binaryren can be installed indepedenently. To do so, download and compile Binaryren:

```
git clone https://github.com/WebAssembly/binaryen
cd binaryren
cmake . && make
```

The above should automatically build and install the required toolchain and add wasm-opt to your path.

#### [optional] Run wasm-opt 

Now, run `wasm-opt` in the directory where you placed opencv_js.wasm:

```
wasm-opt -O3 -o opencv_js_opt.wasm opencv_js.wasm
```

The `O3` flag indicates aggressively optimising for speed. Other flags can be specified to reduce the size of the binary instead, but they don't help much in this case:

- `-Os` optimise for size
- `-Oz` aggressively optimise for size
- `-O[1-4]` optimise for speed
