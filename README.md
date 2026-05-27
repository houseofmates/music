<h1 align="center">music</h1>

<p align="center">a self-hosted, high-performance music streaming server with advanced discovery features.</p>

<h2 align="center">features</h2>

- **local music library** - organize and stream your personal music collection
- **advanced search** - semantic search with embeddings for finding songs by lyrics, mood, or description
- **ai-powered discovery** - discover new music based on your listening habits
- **collaborative playlists** - create and share playlists with friends
- **offline access** - mobile app support with passcode authentication
- **high-quality audio** - supports various audio formats (mp3, flac, etc.)
- **web interface** - modern web ui for browsing and playing music
- **api server** - restful api for integration with mobile apps and other services

<h2 align="center">installation</h2>

<h3 align="center">prerequisites</h3>

- python 3.10+
- postgresql or sqlite (default)
- ollama (optional, for ai features)
- ffmpeg (for audio processing)

<h3 align="center">step-by-step</h3>

1. **clone the repository:**

2. **install dependencies:**

3. **configure environment:**

<p align="center">edit to set your configuration:</p>
- : path to your music collection
- : (optional) api key for acoustic fingerprinting
- : url of your ollama server (default: http://127.0.0.1:11434)
-  and : for mobile app offline authentication

4. **initialize the database:**

5. **start the server:**

<p align="center">the server will be available at http://localhost:8000</p>

<h2 align="center">configuration</h2>

<h3 align="center">environment variables</h3>

<div align="center">
<table>
  <thead>
    <tr><th>variable</th><th>default</th><th>description</th></tr>
  </thead>
  <tbody>
    <tr><td></td><td></td><td>directory containing your music files</td></tr>
    <tr><td></td><td></td><td>database connection string</td></tr>
    <tr><td></td><td>(empty)</td><td>api key for acoustid fingerprinting</td></tr>
    <tr><td></td><td></td><td>user agent for musicbrainz api</td></tr>
    <tr><td></td><td></td><td>url for ollama server (ai features)</td></tr>
    <tr><td></td><td>(empty)</td><td>username for mobile app passcode authentication</td></tr>
    <tr><td></td><td>(empty)</td><td>bcrypt hash of the passcode password</td></tr>
    <tr><td></td><td>(auto-generated)</td><td>secret key for jwt tokens (set for production)</td></tr>
    <tr><td></td><td></td><td>server host</td></tr>
    <tr><td></td><td></td><td>server port</td></tr>
  </tbody>
</table>
</div>

<h3 align="center">passcode authentication</h3>

<p align="center">for mobile app offline access, you can set up passcode authentication:</p>

1. choose a username and password
2. generate a bcrypt hash:

3. set  and  in your  file

<h2 align="center">usage</h2>

<h3 align="center">web interface</h3>

<p align="center">navigate to http://localhost:8000 in your browser to access the web ui.</p>

<h3 align="center">api</h3>

<p align="center">the server provides a restful api at . see the api documentation for details.</p>

<h3 align="center">mobile app</h3>

<p align="center">use the official mobile app with the passcode authentication or jwt tokens.</p>

<h2 align="center">development</h2>

<h3 align="center">running tests</h3>

<pre align="center"><code>============================= test session starts ==============================
platform linux -- Python 3.14.3, pytest-9.0.3, pluggy-1.6.0
rootdir: /home/house
configfile: pyproject.toml
plugins: anyio-4.13.0, xdist-3.8.0, asyncio-1.3.0
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
created: 8/8 workers
8 workers [0 items]


============================ no tests ran in 0.68s =============================
</code></pre>

<h3 align="center">code style</h3>

<p align="center">we use black for code formatting and ruff for linting.</p>

<h2 align="center">contributing</h2>

1. fork the repository
2. create a feature branch
3. make your changes
4. add tests if applicable
5. submit a pull request

<h2 align="center">security</h2>

<p align="center">if you discover a security vulnerability, please report it to john@houseofmates.space</p>

<h2 align="center">license</h2>

<p align="center"><a href="license">mates license</a></p>
