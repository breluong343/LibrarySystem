(function openBlueSquareWindow() {
    const win = window.open('', '_blank', 'width=300,height=300');
    if (!win) return;

    win.document.write(`
        <!doctype html>
        <html>
            <head>
                <title>Blue Square</title>
                <style>
                    body {
                        margin: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        background: #ffffff;
                    }
                    .square {
                        width: 150px;
                        height: 150px;
                        background: #007bff;
                    }
                </style>
            </head>
            <body>
                <div class="square"></div>
            </body>
        </html>
    `);
    win.document.close();
})();