from pathlib import Path
from docx import Document
from docx.shared import Inches, Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from PIL import Image, ImageDraw, ImageFont

ROOT = Path('/Users/priyanshusingh/Documents/Projects/Code Arena _ Real Time Coding Platform')
OUT = ROOT / 'CodeArena_Project_Work_Report.docx'
ASSETS = ROOT / 'report_assets'
ASSETS.mkdir(exist_ok=True)
IMAGE_DIR = Path('/Users/priyanshusingh/Downloads')

BLUE = '#293c8d'
LIGHT_BLUE = '#dce8f5'
RED = '#a61937'
BLACK = '#000000'
GRAY = '#6b7280'


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd')
        tc_pr.append(shd)
    shd.set(qn('w:fill'), fill.replace('#', ''))


def set_cell_margins(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in('w:tcMar')
    if tc_mar is None:
        tc_mar = OxmlElement('w:tcMar')
        tc_pr.append(tc_mar)
    for margin, value in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = tc_mar.find(qn(f'w:{margin}'))
        if node is None:
            node = OxmlElement(f'w:{margin}')
            tc_mar.append(node)
        node.set(qn('w:w'), str(value))
        node.set(qn('w:type'), 'dxa')


def set_cell_border(cell, color='D9D9D9', size='6'):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in('w:tcBorders')
    if borders is None:
        borders = OxmlElement('w:tcBorders')
        tc_pr.append(borders)
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        tag = f'w:{edge}'
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn('w:val'), 'single')
        element.set(qn('w:sz'), size)
        element.set(qn('w:space'), '0')
        element.set(qn('w:color'), color)


def add_page_field(paragraph):
    run = paragraph.add_run()
    fld_char1 = OxmlElement('w:fldChar')
    fld_char1.set(qn('w:fldCharType'), 'begin')
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = ' PAGE '
    fld_char2 = OxmlElement('w:fldChar')
    fld_char2.set(qn('w:fldCharType'), 'end')
    run._r.append(fld_char1)
    run._r.append(instr)
    run._r.append(fld_char2)


def configure_document(doc):
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.top_margin = Mm(30)
    section.bottom_margin = Mm(22)
    section.left_margin = Mm(30)
    section.right_margin = Mm(20)
    section.header_distance = Mm(12)
    section.footer_distance = Mm(10)

    styles = doc.styles
    normal = styles['Normal']
    normal.font.name = 'Times New Roman'
    normal._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.space_after = Pt(8)

    for name, size in [('Title', 22), ('Heading 1', 18), ('Heading 2', 16), ('Heading 3', 14)]:
        style = styles[name]
        style.font.name = 'Times New Roman'
        style._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.paragraph_format.space_before = Pt(12)
        style.paragraph_format.space_after = Pt(8)

    for section in doc.sections:
        footer = section.footer.paragraphs[0]
        footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer.add_run('CodeArena Project Work Report | ')
        add_page_field(footer)


def paragraph(doc, text='', bold_prefix=None, align=None, style=None):
    p = doc.add_paragraph(style=style)
    if align is not None:
        p.alignment = align
    if bold_prefix and text.startswith(bold_prefix):
        p.add_run(bold_prefix).bold = True
        p.add_run(text[len(bold_prefix):])
    else:
        p.add_run(text)
    return p


def heading(doc, text, level=1):
    p = doc.add_paragraph(style=f'Heading {level}')
    if level == 1:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run(text)
    return p


def page_break(doc):
    doc.add_page_break()


def title_page(doc, title, subtitle=None):
    for _ in range(2):
        doc.add_paragraph()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(title)
    r.bold = True
    r.font.name = 'Times New Roman'
    r.font.size = Pt(22)
    if subtitle:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(subtitle)
        r.italic = True
        r.font.size = Pt(14)
    for _ in range(1):
        doc.add_paragraph()
    lines = [
        'A Project Work Report',
        'Submitted in partial fulfillment of the requirements for the degree of',
        'BACHELOR OF TECHNOLOGY',
        'INFORMATION TECHNOLOGY',
        '',
        'BY',
        'PRIYANSHU SINGH',
        'University Roll No: EN23IT301085',
        '',
        'Under the Guidance of',
        'Prof. Deepa Pandit',
        'Professor, Department of Information Technology',
    ]
    for line in lines:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(line)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12 if line not in ('BACHELOR OF TECHNOLOGY', 'INFORMATION TECHNOLOGY') else 14)
        if line in ('BACHELOR OF TECHNOLOGY', 'INFORMATION TECHNOLOGY', 'PRIYANSHU SINGH'):
            r.bold = True
    for _ in range(1):
        doc.add_paragraph()
    for line in ['Department of Information Technology', 'Faculty of Engineering', 'MEDICAPS UNIVERSITY, INDORE-453331', 'November 2026']:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(line)
        r.bold = line == 'MEDICAPS UNIVERSITY, INDORE-453331'
        r.font.size = Pt(12)


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    hdr = table.rows[0].cells
    for i, value in enumerate(headers):
        hdr[i].text = value
        set_cell_shading(hdr[i], BLUE)
        set_cell_margins(hdr[i])
        set_cell_border(hdr[i])
        hdr[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for run in hdr[i].paragraphs[0].runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10)
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
            set_cell_margins(cells[i])
            set_cell_border(cells[i])
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if row_index % 2 == 1:
                set_cell_shading(cells[i], 'F3F6FA')
            for run in cells[i].paragraphs[0].runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(10)
    if widths:
        for row in table.rows:
            for idx, width in enumerate(widths):
                row.cells[idx].width = Inches(width)
    doc.add_paragraph()
    return table


def add_figure(doc, path, caption, width=6.2):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width))
    c = doc.add_paragraph()
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = c.add_run(caption)
    r.italic = True
    r.font.size = Pt(10)


def _font(size, bold=False):
    candidates = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/Library/Fonts/Arial Bold.ttf' if bold else '/Library/Fonts/Arial.ttf',
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def make_diagram(path, title, nodes, edges, decisions=None):
    image = Image.new('RGB', (1600, 900), 'white')
    draw = ImageDraw.Draw(image)
    navy = '#26384f'
    draw.rectangle((12, 12, 1588, 888), outline='#a8b8db', width=3)
    draw.text((55, 45), title, font=_font(38, True), fill=BLUE)
    draw.line((55, 100, 680, 100), fill=BLUE, width=6)
    draw.line((680, 100, 860, 100), fill=RED, width=6)

    def scale(x, y):
        return int(x * 125 + 100), int((6.7 - y) * 105 + 130)

    def centered_text(x, y, text, font, fill=navy):
        box = draw.textbbox((0, 0), text, font=font)
        draw.text((x - (box[2]-box[0]) / 2, y - (box[3]-box[1]) / 2), text, font=font, fill=fill)

    for source, target, text in edges:
        x1, y1, _ = nodes[source]
        x2, y2, _ = nodes[target]
        p1, p2 = scale(x1, y1), scale(x2, y2)
        draw.line((p1, p2), fill=navy, width=3)
        # Compact arrow head at the target.
        import math
        angle = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
        size = 13
        a = (p2[0] - size * math.cos(angle - 0.45), p2[1] - size * math.sin(angle - 0.45))
        b = (p2[0] - size * math.cos(angle + 0.45), p2[1] - size * math.sin(angle + 0.45))
        draw.polygon([p2, a, b], fill=navy)
        if text:
            mx, my = (p1[0] + p2[0]) // 2, (p1[1] + p2[1]) // 2 - 14
            centered_text(mx, my, text, _font(17, True), RED)

    for _, (x, y, label) in nodes.items():
        px, py = scale(x, y)
        if label.startswith('DECISION:'):
            label = label.replace('DECISION:', '')
            pts = [(px, py-38), (px+72, py), (px, py+38), (px-72, py)]
            draw.polygon(pts, fill='#fff2c9', outline=navy)
        else:
            draw.rounded_rectangle((px-82, py-30, px+82, py+30), radius=9, fill=LIGHT_BLUE, outline=navy, width=2)
        centered_text(px, py, label, _font(16, True))
    image.save(path)


def create_generated_diagrams():
    er_nodes = {
        'user': (2, 4.8, 'User'), 'problem': (5, 4.8, 'Problem'), 'submission': (8, 4.8, 'Submission'),
        'battle': (3.5, 2.6, 'Battle'), 'participant': (6, 2.6, 'BattleParticipant'), 'mcq': (9, 2.6, 'MCQQuestion'),
    }
    er_edges = [('user', 'submission', '1 : many'), ('problem', 'submission', '1 : many'), ('user', 'participant', '1 : many'), ('battle', 'participant', '1 : many'), ('mcq', 'user', 'attempts')]
    make_diagram(ASSETS / 'er_diagram.png', 'Entity Relationship Diagram', er_nodes, er_edges)

    dfd0_nodes = {
        'user': (1.5, 3.2, 'User'), 'system': (5.4, 3.2, 'CodeArena'), 'judge': (9.4, 4.2, 'Judge0 API'), 'db': (9.4, 2.2, 'PostgreSQL'),
    }
    dfd0_edges = [('user', 'system', 'requests'), ('system', 'user', 'JSON response'), ('system', 'judge', 'code + tests'), ('system', 'db', 'read/write')]
    make_diagram(ASSETS / 'dfd_level0.png', 'Data Flow Diagram Level 0', dfd0_nodes, dfd0_edges)

    dfd1_nodes = {
        'auth': (2, 4.8, '1. Auth'), 'practice': (5, 4.8, '2. Practice'), 'battle': (8, 4.8, '3. Battle'),
        'store': (5, 2.2, 'Data Store'), 'judge': (9.8, 2.2, 'Judge0'),
    }
    dfd1_edges = [('auth', 'store', 'user data'), ('practice', 'store', 'problems/submissions'), ('practice', 'judge', 'code/tests'), ('battle', 'store', 'ratings'), ('battle', 'practice', 'live events')]
    make_diagram(ASSETS / 'dfd_level1.png', 'Data Flow Diagram Level 1', dfd1_nodes, dfd1_edges)

    seq_nodes = {
        'start': (1, 4.2, 'User'), 'frontend': (3.2, 4.2, 'React'), 'api': (5.4, 4.2, 'Express API'), 'judge': (7.6, 4.2, 'Judge0'), 'db': (9.8, 4.2, 'Database'),
        'result': (5.4, 2.0, 'Verdict'),
    }
    seq_edges = [('start', 'frontend', 'submit'), ('frontend', 'api', 'POST /submit'), ('api', 'judge', 'execute'), ('judge', 'api', 'result'), ('api', 'db', 'save'), ('api', 'result', 'response')]
    make_diagram(ASSETS / 'sequence_code_submission.png', 'Sequence Diagram for Code Submission', seq_nodes, seq_edges)


def build():
    create_generated_diagrams()
    doc = Document()
    configure_document(doc)
    title_page(doc, 'CodeArena: A Real-Time Competitive Coding Platform')
    page_break(doc)
    title_page(doc, 'CodeArena: A Real-Time Competitive Coding Platform', 'A Project Work Report')

    approval_heading = heading(doc, 'Report Approval', 1)
    approval_heading.paragraph_format.page_break_before = True
    paragraph(doc, 'The project work “CodeArena: A Real-Time Competitive Coding Platform” is hereby approved as a creditable study of an engineering subject carried out and presented in a manner satisfactory to warrant its acceptance as a prerequisite for the Bachelor of Technology degree in Information Technology.')
    paragraph(doc, 'The approval is limited to acceptance of the project report and does not endorse every statement, opinion, or conclusion contained in it.')
    paragraph(doc, '\nInternal Examiner\nName: ______________________________\nDesignation: ______________________\nAffiliation: Medicaps University, Indore')
    paragraph(doc, '\nExternal Examiner\nName: ______________________________\nDesignation: ______________________\nAffiliation: _______________________')
    page_break(doc)

    heading(doc, 'Declaration', 1)
    paragraph(doc, 'I, Priyanshu Singh, hereby declare that the project entitled “CodeArena: A Real-Time Competitive Coding Platform” is submitted in partial fulfillment for the award of the degree of Bachelor of Technology in Information Technology. The work was carried out under the supervision of Prof. Deepa Pandit, Professor, Department of Information Technology, Medicaps University, Indore.')
    paragraph(doc, 'I further declare that this report is an authentic record of my project work and that the content has not been submitted to any other institute or university for the award of any degree or diploma.')
    paragraph(doc, '\nSignature of Student: ____________________\nName: Priyanshu Singh\nRoll No.: EN23IT301085\nDate: ____________________')
    page_break(doc)

    heading(doc, 'Certificate', 1)
    paragraph(doc, 'This is to certify that the project entitled “CodeArena: A Real-Time Competitive Coding Platform” submitted in partial fulfillment for the award of the degree of Bachelor of Technology by Priyanshu Singh, Roll No. EN23IT301085, is a record of work carried out under my guidance in the Department of Information Technology, Medicaps University, Indore.')
    paragraph(doc, '\n\nProf. Deepa Pandit\nProfessor, Department of Information Technology\nMedicaps University, Indore\n\n\nProf. (Dr.) Vidhya Barpha\nHead, Department of Information Technology\nMedicaps University, Indore')
    page_break(doc)

    heading(doc, 'Acknowledgement', 1)
    paragraph(doc, 'I express my sincere gratitude to the management and faculty of Medicaps University for providing the academic environment and facilities required to complete this project work. I thank Prof. (Dr.) Vidhya Barpha, Head of the Department of Information Technology, for continuous encouragement and support.')
    paragraph(doc, 'I am especially grateful to my guide, Prof. Deepa Pandit, Professor, Department of Information Technology, for her guidance, technical suggestions, and valuable feedback throughout the planning, implementation, and documentation of CodeArena. I also thank my classmates and everyone who contributed feedback during testing.')
    paragraph(doc, '\n\nPriyanshu Singh\nB.Tech. IV Year\nDepartment of Information Technology\nMedicaps University, Indore')
    page_break(doc)

    heading(doc, 'Abstract', 1)
    paragraph(doc, 'CodeArena is a full-stack competitive programming and interview-practice platform designed to combine individual preparation with real-time coding competition. The platform provides coding problems, a Monaco-based editor, code execution and submission workflows, debugging challenges, technical multiple-choice questions, mock interview sessions, rating and leaderboard views, and a foundation for real-time one-to-one battles. The system is implemented with React.js and Vite on the frontend, Node.js and Express.js on the backend, JWT and bcryptjs for authentication, Prisma with PostgreSQL for the relational data model, Socket.IO for real-time communication, and Judge0 as the planned external code-execution service.')
    paragraph(doc, 'The application follows a layered client-server architecture. The React client communicates with REST APIs through Axios. Express middleware validates JWT tokens and routes requests to application logic. Prisma represents entities such as users, problems, test cases, submissions, battles, participants, MCQ attempts, leaderboards, and notifications. During development, demo mode stores users and catalogue data locally and uses a problem-aware local judge for predictable testing. Production integration is planned through the Judge0 CE API using the RapidAPI free tier.')
    paragraph(doc, 'The project focuses on a practical and extensible learning workflow. Users can move from problem practice to debugging, MCQ revision, and interview simulation while tracking progress. Real-time battle, matchmaking, bot fallback, and private-room capabilities are included as partial modules and documented as future completion work. The report presents the requirements, feasibility, architecture, design, implementation, testing, limitations, and future scope of CodeArena.')
    paragraph(doc, 'Keywords: competitive programming, coding practice, React.js, Express.js, PostgreSQL, Prisma, JWT, Socket.IO, Judge0, interview preparation')
    page_break(doc)

    heading(doc, 'Table of Contents', 1)
    toc = ['Abstract', 'Chapter 1 Introduction', 'Chapter 2 Feasibility Study and Requirements', 'Chapter 3 System Analysis and Design', 'Chapter 4 Implementation', 'Chapter 5 Testing and Results', 'Chapter 6 Limitations and Future Scope', 'Chapter 7 Summary and Conclusion', 'References', 'Appendix A API Summary', 'Appendix B User Guide']
    for i, item in enumerate(toc, 1):
        paragraph(doc, f'{i}. {item}')
    page_break(doc)

    heading(doc, 'List of Figures', 1)
    for item in ['Figure 3.1 Use Case Diagram', 'Figure 3.2 Entity Relationship Diagram', 'Figure 3.3 Data Flow Diagram Level 0', 'Figure 3.4 Data Flow Diagram Level 1', 'Figure 3.5 Activity Diagram and Battle Workflow', 'Figure 3.6 Sequence Diagram for Code Submission', 'Figure 3.7 Class Diagram', 'Figure 3.8 System Architecture']:
        paragraph(doc, item)
    heading(doc, 'List of Tables', 1)
    for item in ['Table 2.1 Functional Requirements', 'Table 2.2 Non-Functional Requirements', 'Table 2.3 Hardware and Software Requirements', 'Table 5.1 Functional Test Cases', 'Table 5.2 Module Status']:
        paragraph(doc, item)
    page_break(doc)

    heading(doc, 'Abbreviations', 1)
    add_table(doc, ['Abbreviation', 'Meaning'], [['API', 'Application Programming Interface'], ['CRUD', 'Create, Read, Update, Delete'], ['DFD', 'Data Flow Diagram'], ['JWT', 'JSON Web Token'], ['MCQ', 'Multiple Choice Question'], ['ORM', 'Object Relational Mapping'], ['REST', 'Representational State Transfer'], ['SDE', 'Software Development Engineer'], ['UI', 'User Interface'], ['UML', 'Unified Modeling Language']])
    heading(doc, 'Notations and Symbols', 1)
    add_table(doc, ['Notation', 'Meaning'], [['→', 'Data or control flow'], ['1 : many', 'One-to-many relationship'], ['<<include>>', 'Required included interaction'], ['HTTP 2xx', 'Successful request'], ['HTTP 4xx', 'Client or authorization error'], ['HTTP 5xx', 'Server error']])
    page_break(doc)

    heading(doc, 'Chapter 1', 1)
    heading(doc, 'Introduction', 1)
    heading(doc, '1.1 Background', 2)
    paragraph(doc, 'Technical interviews increasingly evaluate more than a candidate’s ability to solve isolated algorithmic questions. Candidates are expected to practise data structures and algorithms, understand debugging, revise computer science concepts, and perform under time pressure. These activities are often spread across multiple tools, which makes it difficult to maintain a single record of progress and connect practice outcomes with interview readiness.')
    paragraph(doc, 'CodeArena addresses this gap by bringing coding practice, debugging, MCQs, mock interviews, and competitive battles into one platform. The system is designed as a full-stack web application with a clear separation between the React client, Express API, persistence layer, external code execution, and real-time communication services.')
    heading(doc, '1.2 Problem Statement', 2)
    paragraph(doc, 'Students commonly use separate platforms for problem solving, debugging practice, technical MCQs, interview simulations, and competitive coding. This fragmentation reduces continuity, makes progress difficult to compare, and provides limited feedback about the next activity a learner should attempt. CodeArena proposes one integrated platform with authenticated practice, evaluated submissions, progress tracking, and a foundation for real-time competition.')
    heading(doc, '1.3 Motivation', 2)
    paragraph(doc, 'The motivation for CodeArena is to make interview preparation more measurable and engaging. A learner should be able to practise a problem, receive a verdict, identify a debugging weakness, revise an MCQ topic, and then test the same skills in a timed battle or mock interview. The project also provides practical experience with full-stack architecture, authentication, relational modelling, third-party APIs, and event-driven communication.')
    heading(doc, '1.4 Objectives', 2)
    for text in ['Design a responsive platform for coding and interview preparation.', 'Provide authenticated access to practice modules and user progress.', 'Support code editing, running, submitting, and verdict tracking.', 'Offer debugging challenges and technical MCQ practice.', 'Provide timed mock interview sessions using mixed practice sections.', 'Design real-time battle, matchmaking, private-room, rating, and leaderboard workflows.', 'Use a modular architecture that can later support production Judge0 execution and scalable real-time services.']:
        paragraph(doc, text, style='List Bullet')
    heading(doc, '1.5 Scope', 2)
    paragraph(doc, 'The current project scope includes the React interface, Express REST API, JWT authentication, demo-mode user persistence, problem and challenge catalogues, dashboard, practice pages, submission workflows, PostgreSQL Prisma schema, Socket.IO server foundation, and documentation. Real-time one-to-one battle execution, matchmaking with bot fallback, private rooms, and production Judge0 integration remain partial or planned modules and are identified clearly in the limitations chapter.')
    heading(doc, '1.6 Contributions', 2)
    paragraph(doc, 'The project contribution is an integrated preparation workflow rather than a single algorithm editor. CodeArena combines multiple learning modes, models their relationships, and establishes the interfaces required for code execution and live competition. The dashboard also includes a rule-based Adaptive Training Loop that recommends a next mission from user signals such as debugging score, MCQ progress, wins, losses, and solved problems.')
    heading(doc, '1.7 Organization of the Report', 2)
    paragraph(doc, 'Chapter 1 introduces the problem and objectives. Chapter 2 presents feasibility, requirements, and platform specifications. Chapter 3 explains the system analysis and design using UML, data-flow, and architecture diagrams. Chapter 4 describes implementation. Chapter 5 presents testing and results. Chapter 6 records limitations and future scope. Chapter 7 concludes the report.')
    heading(doc, '1.8 Literature Review', 2)
    paragraph(doc, 'Existing coding platforms demonstrate the value of curated problem catalogues, online editors, automated evaluation, discussion, and competitive ranking. Interview preparation platforms additionally emphasize topic-wise practice, timed assessments, and progress measurement. CodeArena takes inspiration from these categories while focusing on a combined workflow for coding, debugging, MCQs, interviews, and live battles. The project does not attempt to replace large public catalogues; its academic contribution is the integration and architectural study of these interactions.')
    heading(doc, '1.9 Research Design', 2)
    paragraph(doc, 'The project follows an iterative engineering design. Requirements were grouped into authentication, practice, evaluation, real-time communication, analytics, and documentation. The frontend and backend were developed as separate workspaces. Demo mode was used for predictable development feedback, while the Prisma schema and environment configuration preserve a path to PostgreSQL and Judge0 integration. Validation was performed through functional test cases and manual workflow checks.')
    page_break(doc)

    heading(doc, 'Chapter 2', 1)
    heading(doc, 'Feasibility Study and Requirements', 1)
    heading(doc, '2.1 Existing System', 2)
    paragraph(doc, 'The existing preparation workflow is distributed across separate coding, debugging, MCQ, interview, and competitive-programming platforms. Each platform may store progress differently and may not connect a learner’s coding verdict with their broader interview readiness. Real-time competition is also commonly separated from practice, which creates a gap between learning and performance under pressure.')
    heading(doc, '2.2 Proposed System', 2)
    paragraph(doc, 'CodeArena provides a common authenticated workspace for practice and competition. Its frontend exposes a consistent navigation structure, while the backend provides module-specific APIs. The design treats Judge0 and Socket.IO as external systems: Judge0 executes code in an isolated environment, while Socket.IO carries presence and battle events. The project’s use-case scope intentionally contains only Guest, Registered User, Judge0, and Socket.IO.')
    heading(doc, '2.2.1 Economical Feasibility', 2)
    paragraph(doc, 'CodeArena currently runs in demo mode using a local problem-aware judge for development and testing. For the production version, the project is planned to use the Judge0 CE API through the RapidAPI free tier. This option is economically feasible because it avoids infrastructure costs during the initial development stage. If usage increases, the system can later migrate to a paid RapidAPI plan or self-hosted Judge0. The remaining development tools are open-source or available under free tiers, including React, Vite, Express.js, Prisma, PostgreSQL, Socket.IO, and VS Code.')
    heading(doc, '2.2.2 Technical Feasibility', 2)
    paragraph(doc, 'The proposed technologies are suitable for the project. React supports component-based interfaces, Express provides lightweight REST routing, PostgreSQL provides relational consistency, Prisma supplies typed database access, JWT supports stateless protected routes, and Socket.IO supplies event-based communication. The main technical risks are isolated code execution, real-time synchronization, and production persistence; these are addressed through external execution, explicit API boundaries, and a relational schema.')
    heading(doc, '2.2.3 Operational Feasibility', 2)
    paragraph(doc, 'The platform is designed for students and interview candidates. Its navigation separates practice modes, while the dashboard summarizes progress and recommends a next activity. The system can run locally for evaluation and can be deployed later using a hosted frontend, backend, and managed PostgreSQL service.')
    heading(doc, '2.3 Platform Specification', 2)
    heading(doc, '2.3.1 Hardware Requirements', 3)
    paragraph(doc, 'The project can be developed and demonstrated on a typical student development machine. The following specification is used for the report: Intel Core i5 or equivalent processor, 8 GB RAM, 512 GB SSD, stable internet connection, and a 64-bit laptop or desktop.')
    heading(doc, '2.3.2 Software Requirements', 3)
    add_table(doc, ['Category', 'Requirement'], [['Operating system', 'Windows 11, macOS, or Ubuntu 22.04+'], ['Runtime', 'Node.js 18 or later and npm'], ['Frontend', 'React.js, Vite, Tailwind CSS, React Router, Axios, Monaco Editor'], ['Backend', 'Node.js, Express.js, JWT, bcryptjs, Socket.IO'], ['Database', 'PostgreSQL with Prisma ORM'], ['External services', 'Judge0 CE API for planned production execution'], ['Development tools', 'VS Code, Git, modern browser']])
    heading(doc, '2.4 Functional Requirements', 2)
    add_table(doc, ['ID', 'Requirement'], [['FR-01', 'The system shall allow a guest to register and log in.'], ['FR-02', 'The system shall protect authenticated routes with JWT validation.'], ['FR-03', 'The system shall display coding problems with difficulty, tags, samples, and constraints.'], ['FR-04', 'The system shall allow a registered user to write code and select a language.'], ['FR-05', 'The system shall run and submit code and display a verdict.'], ['FR-06', 'The system shall provide debugging challenges and MCQ practice.'], ['FR-07', 'The system shall provide timed mock interview sessions.'], ['FR-08', 'The system shall provide battle, matchmaking, private-room, leaderboard, and rating workflows.'], ['FR-09', 'The system shall store user progress, submissions, attempts, and battle results when persistence is enabled.']])
    heading(doc, '2.5 Non-Functional Requirements', 2)
    add_table(doc, ['ID', 'Requirement'], [['NFR-01', 'Usability: the interface shall be readable and consistent across modules.'], ['NFR-02', 'Security: passwords shall be hashed and protected routes shall require JWTs.'], ['NFR-03', 'Performance: common API responses should remain lightweight and modular.'], ['NFR-04', 'Reliability: failed requests shall return controlled errors instead of breaking the UI.'], ['NFR-05', 'Maintainability: frontend pages, backend routes, data, and middleware shall remain separated.'], ['NFR-06', 'Scalability: the schema and service boundaries shall support PostgreSQL, Judge0, and future Redis scaling.']])
    page_break(doc)

    heading(doc, 'Chapter 3', 1)
    heading(doc, 'System Analysis and Design', 1)
    heading(doc, '3.1 Use Case Diagram', 2)
    paragraph(doc, 'The use-case diagram contains only the real runtime actors. Guest can register or log in. Registered User can use the practice and competition modules. Judge0 is an external code-execution system and Socket.IO is an external real-time communication service. Admin and Database are not actors because neither represents a current user interaction in the implemented workflow.')
    add_figure(doc, IMAGE_DIR / 'CodeArena_UseCase_Slide final one.png', 'Figure 3.1 Use Case Diagram', 6.2)
    heading(doc, '3.2 Entity Relationship Diagram', 2)
    paragraph(doc, 'The relational model separates identity, learning content, evaluation, and competition. User is related to submissions, MCQ attempts, battle participation, leaderboard data, and notifications. Problem owns test cases and receives submissions. Battle connects users through BattleParticipant records.')
    add_figure(doc, ASSETS / 'er_diagram.png', 'Figure 3.2 Entity Relationship Diagram', 6.2)
    heading(doc, '3.3 Data Flow Diagrams', 2)
    paragraph(doc, 'At Level 0, the user communicates with CodeArena, which reads and writes persistent data and delegates code execution to Judge0. Level 1 separates authentication, practice, and battle flows to show how requests are processed by the application.')
    add_figure(doc, ASSETS / 'dfd_level0.png', 'Figure 3.3 Data Flow Diagram Level 0', 6.2)
    add_figure(doc, ASSETS / 'dfd_level1.png', 'Figure 3.4 Data Flow Diagram Level 1', 6.2)
    heading(doc, '3.4 Activity Diagram and Workflow', 2)
    paragraph(doc, 'The battle workflow begins after registration or login. The user enters matchmaking, and the system checks whether a suitable opponent is available. If no player is available, the planned fallback starts a bot battle. During the battle, the user solves and submits code, Judge0 or the local demo judge returns a verdict, and the result is used to update the score and leaderboard workflow.')
    add_figure(doc, IMAGE_DIR / 'CodeArena_ActivityDiagram_Slide.final silde.png', 'Figure 3.5 Activity Diagram and Battle Workflow', 6.2)
    heading(doc, '3.5 Sequence Diagram for Code Submission', 2)
    paragraph(doc, 'The sequence begins when the user submits code from the React editor. Axios sends a request to the Express API. The API authenticates the request, validates the payload, sends code and test data to the execution service, stores the submission result, and returns a JSON verdict to the frontend.')
    add_figure(doc, ASSETS / 'sequence_code_submission.png', 'Figure 3.6 Sequence Diagram for Code Submission', 6.2)
    heading(doc, '3.6 Class Diagram', 2)
    paragraph(doc, 'The class view represents the main domain entities and their relationships. It emphasizes User, Problem, Submission, Battle, BattleParticipant, MCQQuestion, MCQAttempt, DebugChallenge, TestCase, Leaderboard, and Notification.')
    add_figure(doc, IMAGE_DIR / 'CodeArena_ClassDiagram_Slide final one.png', 'Figure 3.7 Class Diagram', 6.2)
    heading(doc, '3.7 System Architecture', 2)
    paragraph(doc, 'The architecture is organized into a React client, an Express server, a PostgreSQL database accessed through Prisma, and external Judge0 and Socket.IO services. The frontend communicates with the backend through REST APIs and receives live events through Socket.IO. The backend applies authentication and business rules before reading or writing data.')
    add_figure(doc, IMAGE_DIR / ' final ppt.png', 'Figure 3.8 System Architecture', 6.2)
    page_break(doc)

    heading(doc, 'Chapter 4', 1)
    heading(doc, 'Implementation', 1)
    heading(doc, '4.1 Frontend Implementation', 2)
    paragraph(doc, 'The frontend is built with React.js and Vite. Routes are protected using a ProtectedRoute component and shared authenticated layouts. Pages are separated by responsibility: Dashboard, Problems, Debugging, MCQ, Interview, Battles, Leaderboard, Analytics, and Authentication. Tailwind CSS provides consistent spacing and responsive layout, while Monaco Editor provides the coding workspace.')
    heading(doc, '4.2 Backend Implementation', 2)
    paragraph(doc, 'The backend uses Express.js with modular routers. Authentication, dashboard, problems, submissions, debugging, MCQ, battles, and platform routes are separated. Middleware handles JWT authentication and centralized error responses. Helmet, CORS, Morgan, JSON parsing, and environment validation support a controlled API server.')
    heading(doc, '4.3 Authentication and Authorization', 2)
    paragraph(doc, 'During registration, passwords are hashed with bcryptjs. Login validates the email and password, then returns a JWT. The frontend stores the authenticated session and Axios adds the bearer token to API requests. Protected routes verify the token before returning user-specific data. The schema also supports USER and ADMIN roles, although the current user workflow does not expose an admin actor.')
    heading(doc, '4.4 Problem Practice and Code Evaluation', 2)
    paragraph(doc, 'The coding workspace displays the problem statement, tags, sample input, expected output, language selector, and editor. Run and submit requests include code, language, input, and problem identity. In demo mode, a problem-aware local judge rejects empty, placeholder, random, unrelated, and structurally invalid code, then returns a controlled verdict. The production design delegates isolated execution to Judge0 and stores the resulting verdict, runtime, and memory data.')
    heading(doc, '4.5 Debugging, MCQs, and Interviews', 2)
    paragraph(doc, 'Debugging challenges provide buggy code, expected behavior, error type, difficulty, tags, and test cases. MCQ questions contain options, answers, explanations, category, and difficulty. Interview sessions combine coding, debugging, and MCQ sections and expose a time limit and interviewer notes to guide the practice round.')
    heading(doc, '4.6 Real-Time Battle Foundation', 2)
    paragraph(doc, 'The Socket.IO server tracks connected players, broadcasts presence updates, and supports battle invitation events. The application design includes matchmaking, timers, rooms, private invitations, and battle result updates. These features are partially implemented and require further end-to-end synchronization and persistence before they can be described as fully production-ready.')
    heading(doc, '4.7 Adaptive Training Loop', 2)
    paragraph(doc, 'The dashboard includes a deterministic recommendation feature called Adaptive Training Loop. It selects a mission using observable signals: low debugging score selects Repair mode, low MCQ progress selects Recall mode, a higher loss count selects Resilience mode, and balanced progress selects Momentum mode. The interface explains why a mission was selected and stores completion for the current user in local storage. This feature is intentionally rule-based rather than presenting an unsupported claim of artificial intelligence.')
    heading(doc, '4.8 Database and Persistence', 2)
    paragraph(doc, 'The Prisma schema defines PostgreSQL models for users, problems, test cases, submissions, debugging, MCQ attempts, battles, participants, leaderboards, and notifications. Demo mode uses local JSON for users and catalogue data so the project can be demonstrated without a configured PostgreSQL server. The environment configuration preserves the production path through DATABASE_URL and Prisma migrations.')
    page_break(doc)

    heading(doc, 'Chapter 5', 1)
    heading(doc, 'Testing and Results', 1)
    heading(doc, '5.1 Testing Methodology', 2)
    paragraph(doc, 'Testing was performed through module-level checks, API workflow checks, browser-based manual testing, and a production frontend build. The test strategy verifies valid and invalid authentication, protected routes, problem selection, language changes, run and submit behavior, challenge navigation, interview session creation, dashboard loading, and visual consistency across pages.')
    heading(doc, '5.2 Functional Test Cases', 2)
    add_table(doc, ['ID', 'Test Case', 'Expected Result', 'Status'], [['TC-01', 'Register with valid details', 'Account is created and session is returned', 'Pass'], ['TC-02', 'Login with valid credentials', 'User is redirected to dashboard', 'Pass'], ['TC-03', 'Open protected route without token', 'Request is rejected or redirected', 'Pass'], ['TC-04', 'Search and select a coding problem', 'Selected problem details load', 'Pass'], ['TC-05', 'Change programming language', 'Editor template changes to selected language', 'Pass'], ['TC-06', 'Run placeholder code', 'Code receives a non-accepted verdict', 'Pass'], ['TC-07', 'Submit a valid-looking solution', 'Submission is recorded with a verdict', 'Pass in demo mode'], ['TC-08', 'Open debugging challenge', 'Buggy code and expected behavior display', 'Pass'], ['TC-09', 'Start interview session', 'Session sections and level are returned', 'Pass'], ['TC-10', 'Open battle workflow', 'Battle screen loads; live battle flow is partial', 'Partial'], ['TC-11', 'Use private room or bot fallback', 'Workflow is present but requires completion', 'Partial'], ['TC-12', 'Build frontend', 'Vite production build completes', 'Pass']])
    heading(doc, '5.3 Module Status', 2)
    add_table(doc, ['Module', 'Current Status', 'Evidence or Note'], [['Authentication', 'Working', 'JWT, bcryptjs, signup, login, protected routes'], ['Dashboard', 'Working', 'Dashboard API and adaptive mission UI'], ['Problem practice', 'Working in demo mode', 'Catalogue, editor, local verdict workflow'], ['Debugging', 'Working in demo mode', 'Challenge data and submission flow'], ['MCQ practice', 'Working in demo mode', 'Question catalogue and attempt model'], ['Mock interview', 'Working in demo mode', 'Level-based mixed session creation'], ['PostgreSQL persistence', 'Designed / configurable', 'Prisma schema and DATABASE_URL'], ['Judge0 production execution', 'Planned', 'RapidAPI free tier configuration path'], ['Real-time battles', 'Partial', 'Socket.IO foundation and presence/invite events'], ['Matchmaking and private rooms', 'Partial', 'Workflow designed; end-to-end completion pending']])
    heading(doc, '5.4 Result Discussion', 2)
    paragraph(doc, 'The tested core modules support the primary demonstration flow: a user can create an account or log in, open the dashboard, navigate to practice modules, select a problem, write code, run or submit it, and receive a controlled result. The build and lint checks pass for the frontend. The battle-related features are explicitly marked partial so that the report distinguishes the verified demo path from future production work.')
    page_break(doc)

    heading(doc, 'Chapter 6', 1)
    heading(doc, 'Limitations and Future Scope', 1)
    heading(doc, '6.1 Current Limitations', 2)
    for text in ['The application is currently demonstrated on localhost and is not deployed.', 'Demo mode stores user and catalogue data in local JSON and does not provide production-grade persistence by default.', 'The current local judge is a problem-aware development judge and is not a secure replacement for isolated Judge0 execution.', 'Real-time 1v1 battle synchronization, matchmaking, bot fallback, and private rooms are partial.', 'Production security hardening such as rate limiting, secret rotation, audit logging, and abuse prevention is not complete.', 'The report does not claim an active Admin workflow because the current application does not expose one.']:
        paragraph(doc, text, style='List Bullet')
    heading(doc, '6.2 Future Scope', 2)
    for text in ['Complete Judge0 CE integration with asynchronous submission polling, timeout handling, and language mapping.', 'Complete Socket.IO battle rooms with authoritative timers, reconnect handling, bot fallback, and result persistence.', 'Connect all production routes to PostgreSQL through Prisma migrations and seed scripts.', 'Add rate limiting, request validation, secure secret management, and structured audit logs.', 'Deploy the frontend, backend, database, and real-time service using managed infrastructure.', 'Add a separate admin content-management workflow only if future requirements need controlled question authoring.', 'Extend the Adaptive Training Loop with historical submission data and topic-level performance models.']:
        paragraph(doc, text, style='List Bullet')
    page_break(doc)

    heading(doc, 'Chapter 7', 1)
    heading(doc, 'Summary and Conclusion', 1)
    paragraph(doc, 'CodeArena presents a unified platform for competitive coding and interview preparation. The project combines problem solving, code editing, verdict tracking, debugging, MCQs, mock interviews, progress views, and the design of live coding battles in one full-stack application. Its React frontend and Express backend are organized into modular pages and routes, while JWT authentication, bcryptjs, Prisma, PostgreSQL, Socket.IO, and Judge0 define the intended production architecture.')
    paragraph(doc, 'The core practice and authentication flows are working in demo mode and have been tested through browser workflows and a production frontend build. The relational schema and external-service boundaries provide a strong base for future completion. The report is careful to identify partial battle modules, local demo judging, localhost deployment, and the planned RapidAPI free-tier integration. This distinction makes the project technically defensible and gives a clear roadmap for moving from academic prototype to production platform.')
    paragraph(doc, 'The project demonstrates practical full-stack engineering skills: requirement analysis, modular React development, REST API design, authentication, relational modelling, third-party service integration, event-driven communication, testing, and technical documentation. The Adaptive Training Loop adds a distinctive learning feature by explaining why a practice mission is recommended from measurable user signals.')
    page_break(doc)

    heading(doc, 'References', 1)
    refs = [
        '[1] React Documentation, “React – The library for web and native user interfaces,” https://react.dev/.',
        '[2] Vite Documentation, “Vite – Next Generation Frontend Tooling,” https://vite.dev/.',
        '[3] Express.js Documentation, “Express web framework,” https://expressjs.com/.',
        '[4] PostgreSQL Documentation, “PostgreSQL: The World’s Most Advanced Open Source Relational Database,” https://www.postgresql.org/docs/.',
        '[5] Prisma Documentation, “Prisma ORM Documentation,” https://www.prisma.io/docs/.',
        '[6] Socket.IO Documentation, “Bidirectional and low-latency communication,” https://socket.io/docs/.',
        '[7] Judge0 Documentation, “Online Code Execution System,” https://ce.judge0.com/.',
        '[8] IETF, “JSON Web Token (JWT), RFC 7519,” https://www.rfc-editor.org/rfc/rfc7519.',
        '[9] OWASP Foundation, “OWASP Application Security Verification Standard,” https://owasp.org/www-project-application-security-verification-standard/.',
    ]
    for ref in refs:
        paragraph(doc, ref)
    page_break(doc)

    heading(doc, 'Appendix A', 1)
    heading(doc, 'API Summary', 2)
    add_table(doc, ['Method', 'Endpoint', 'Purpose'], [['GET', '/health', 'Check backend health'], ['POST', '/api/v1/auth/signup', 'Create a user account'], ['POST', '/api/v1/auth/login', 'Authenticate a user'], ['GET', '/api/v1/auth/me', 'Return the authenticated user'], ['GET', '/api/v1/dashboard/me', 'Return dashboard data'], ['GET', '/api/v1/problems', 'List coding problems'], ['POST', '/api/v1/submissions/run', 'Run code in demo mode'], ['POST', '/api/v1/submissions/submit', 'Submit code and store verdict'], ['GET', '/api/v1/debugging', 'List debugging challenges'], ['GET', '/api/v1/mcq', 'List MCQ questions'], ['GET', '/api/v1/battles', 'List battle workflows'], ['GET', '/api/v1/platform/leaderboard', 'Return leaderboard'], ['POST', '/api/v1/platform/interview/session', 'Create interview session']])
    heading(doc, 'Appendix B', 1)
    heading(doc, 'User Guide', 2)
    for text in ['Start the application with npm run dev from the project root.', 'Open http://127.0.0.1:5173/login in a browser.', 'Create an account from the signup page or use an existing demo account.', 'Open Dashboard to view progress and the Adaptive Training Loop recommendation.', 'Open Problems, select a challenge, choose a language, write code, and use Run or Submit.', 'Use Debug Arena and MCQ Practice for additional preparation.', 'Use Interview Mode to select a level and start a timed mixed practice session.', 'Use Battles to explore the real-time battle workflow. Battle and private-room features are currently partial.']:
        paragraph(doc, text, style='List Number')

    doc.save(OUT)
    print(OUT)


if __name__ == '__main__':
    build()
