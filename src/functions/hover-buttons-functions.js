/// Functions used for buttons with on-hover functionality
/// First of all, Live translate and Dictionary buttons

function addAstrixToHoverButton(button) {
    if (configs.showDotForHoverButtons == false) return;

    /// add astrix indicator when hover enabled
    let astrix = document.createElement('span');
    astrix.className = 'selecton-hover-button-indicator';
    button.appendChild(astrix);
    return astrix;
}

function showHoverIndicator(indicator) {
    if (configs.showDotForHoverButtons == false) return;
    indicator.style.opacity = 0.3;
}

function hideHoverIndicator(indicator) {
    if (configs.showDotForHoverButtons == false) return;
    indicator.style.opacity = 0;
}


function createHoverPanelForButton(button, initialHtml, onHoverCallback, reverseOrder = false, revealAfterDelay = true, pinOnClick = false, unknownHeight = true) {
    let timerToRemovePanel, timeoutToRevealPanel;
    let hoverIndicator = revealAfterDelay ? addAstrixToHoverButton(button) : undefined;

    /// Set panel
    let panel = document.createElement('div');
    panel.className = 'hover-vertical-tooltip selecton-entity';
    panel.style.borderRadius = `${configs.useCustomStyle ? configs.borderRadius : 3}px`;
    panel.style.opacity = 0;
    // panel.style.visibility = 'collapse';
    panel.style.width = '0px';
    panel.style.pointerEvents = 'none';

    if (initialHtml)
        panel.innerHTML = initialHtml;

    if (tooltipOnBottom)
        panel.style.top = '125%';
    else
        panel.style.bottom = '125%';

    if (reverseOrder) {
        /// specially for the Search button
        if (configs.reverseTooltipButtonsOrder)
            panel.style.right = '0px';
        else
            panel.style.left = '0px';
    } else {
        if (configs.reverseTooltipButtonsOrder)
            panel.style.left = '0px';
        else
            panel.style.right = '0px';
    }

    /// Add panel shadow
    if (configs.addTooltipShadow) {
        panel.style.boxShadow = `0 1px 5px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
    }

    /// Checks to execute after panel was added to the DOM
    let dxTransformValue = configs.reverseTooltipButtonsOrder ? (reverseOrder ? '2px' : '-2px') : (reverseOrder ? '-2px' : '2px');
    let panelOnBottom = false;

    setTimeout(function () {
        // if (!tooltipIsShown) return;
        if (!panel.isConnected) return;

        /// Check if panel will go off-screen
        if (tooltipOnBottom) {
            panelOnBottom = true;
            movePanelToBottom(panel);
        } else {
            panelOnBottom = checkHoverPanelToOverflowOnTop(panel);
        }

        /// Clip content on edge for better looking animation
        if (unknownHeight)
            button.classList.add(panelOnBottom ? 'button-with-bottom-hover-panel' : 'button-with-top-hover-panel');

        /// If button is not alone in the tooltip, and located in the start, align hover panel to the left
        if (!reverseOrder) {
            if (!button.classList.contains('button-with-border') && button.parentNode.children.length > 1) {
                panel.style.left = '0px';
                panel.style.right = 'unset';
                dxTransformValue = '-2px';
            }
        }

        /// Set initial transform position for panel
        panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    }, configs.animationDuration);


    /// Set mouse listeners
    if (button) {
        let delayToRevealOnHover = revealAfterDelay ? (configs.delayToRevealHoverPanels ?? 400) : 0;
        let panelIsPinned = false;

        if (pinOnClick)
            button.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                panelIsPinned = !panelIsPinned;
                button.classList.toggle('highlighted-popup-button');
            });

        button.addEventListener('mouseover', function () {
            try {
                clearTimeout(timerToRemovePanel);
                clearTimeout(timeoutToRevealPanel);
            } catch (e) { }
            timerToRemovePanel = null;

            timeoutToRevealPanel = setTimeout(function () {
                revealHoverPanel(panel, dxTransformValue);
                if (revealAfterDelay) hideHoverIndicator(hoverIndicator);
                if (onHoverCallback) onHoverCallback();
            }, delayToRevealOnHover);
        });

        button.addEventListener('mouseout', function () {
            if (panelIsPinned) return;
            clearTimeout(timeoutToRevealPanel);

            timerToRemovePanel = setTimeout(function () {
                if (!panel) return;

                hideHoverPanel(panel, dxTransformValue, panelOnBottom);
                if (revealAfterDelay) showHoverIndicator(hoverIndicator);
            }, 100);
        });

        button.addEventListener('mousedown', function (e) {
            try {
                clearTimeout(timeoutToRevealPanel);
            } catch (e) { }
        })
    }

    return panel;
}

function checkHoverPanelToOverflowOnTop(panel) {
    /// check to hover panel overflow on screen top
    try {
        if (panel.getBoundingClientRect().top < 0) {
            movePanelToBottom(panel);
            return true;
        } else return false;
    } catch (e) { return false; }
}

function movePanelToBottom(panel) {
    panel.style.bottom = 'unset';
    panel.style.top = '125%';
    if (panel.parentNode)
        panel.parentNode.classList.add('higher-z-index');
}

function revealHoverPanel(panel, dxTransformValue) {
    // panel.style.visibility = 'visible';
    panel.style.width = 'max-content';

    setTimeout(function () {
        panel.style.opacity = 1;
        panel.style.transform = `translate(${dxTransformValue},0%)`;
    }, 3);

    setTimeout(function () {
        if (!panel || !tooltipIsShown) return;
        panel.style.pointerEvents = 'all';
    }, configs.animationDuration);
}

function hideHoverPanel(panel, dxTransformValue, panelOnBottom) {
    panel.style.transform = `translate(${dxTransformValue}, ${panelOnBottom ? -100 : 100}%)`;
    panel.style.opacity = 0.0;
    panel.style.pointerEvents = 'none';
}