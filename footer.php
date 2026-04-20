<?php
// footer.php
$names = [
    [
        "Name" => "Mohamed Ahmed Mohamed",
        "GitHub" => "https://github.com/mohamedahmed2005"
    ],
    [
        "Name" => "Mostafa Mahmoud Fathy",
        "GitHub" => "https://github.com/mostafa-mahmoud-fathy"
    ],
    [
        "Name" => "Mohamed Atef Abd El-Kader",
        "GitHub" => "https://github.com/Mohammed-3tef"
    ],
    [
        "Name" => "Mostafa Ehab Mostafa",
        "GitHub" => "https://github.com/Eng-M0stafaEhab"
    ],
    [
        "Name" => "Marwan Hussein Mohamed",
        "GitHub" => "https://github.com/Marwan-Hussein"
    ],
    [
        "Name" => "Mohamed Ayman Afifi",
        "GitHub" => "https://github.com/mohamed-afifi1"
    ],
    [
        "Name" => "Mahmoud Abd El-Aziz Mahmoud",
        "GitHub" => "https://github.com/Mahmoudabdelaziz-2004"
    ],
    [
        "Name" => "Mohamed Saad Taha",
        "GitHub" => "https://github.com/Mohamed-sa3d200"
    ]
];
?>
<footer class="app-footer">
    <div class="footer-container">
        <div class="footer-brand">
            <strong>Dawaya</strong>
        </div>

        <div class="footer-team">
            <span class="team-member-title">Team Members:</span>
            <div class="team-members">
                <ul>
                    <?php 
                        for($i = 0; $i < count($names) /2; $i++) {
                            echo '<li><a href="' . $names[$i]["GitHub"] . '" target="_blank">' . $names[$i]["Name"] . '</a></li>';
                        }
                    ?>
                </ul>
                <ul>
                    <?php 
                        for($i = count($names) /2; $i < count($names); $i++) {
                            echo '<li><a href="' . $names[$i]["GitHub"] . '" target="_blank">' . $names[$i]["Name"] . '</a></li>';
                        }
                    ?>
                </ul>
            </div>
        </div>

        <div class="copyright">
            <strong>Dawaya</strong> &copy; <?php echo date("Y"); ?> Clinical Sanctuary.
        </div>
    </div>
</footer>