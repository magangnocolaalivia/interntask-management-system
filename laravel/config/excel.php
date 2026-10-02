<?php

return [
    'exports' => [
        'chunk_size' => 1000,
        'pre_calculate_formulas' => false,
        'strict_null_comparison' => false,
        'csv' => [
            'delimiter' => ',',
            'enclosure' => '"',
            'line_ending' => PHP_EOL,
            'use_bom' => false,
            'include_separator_line' => false,
            'excel_compatibility' => false,
            'output_encoding' => '',
        ],
    ],
    'imports' => [
        'read_only' => true,
        'ignore_empty' => false,
        'heading_row' => [
            'formatter' => 'slug',
        ],
    ],
    'extension_detector' => [
        'xlsx' => 'Xlsx',
        'xlsm' => 'Xlsx',
        'xltx' => 'Xlsx',
        'xltm' => 'Xlsx',
        'xls' => 'Xls',
        'xlt' => 'Xls',
        'ods' => 'Ods',
        'ots' => 'Ods',
        'slk' => 'Slk',
        'xml' => 'Xml',
        'gnumeric' => 'Gnumeric',
        'html' => 'Html',
        'htm' => 'Html',
        'csv' => 'Csv',
        'tsv' => 'Csv',
        'pdf' => 'Dompdf',
    ],
];
