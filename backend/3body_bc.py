import numpy as np
from scipy.integrate import solve_ivp
import math
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

from scipy.fft import fft, ifft, fftfreq
import scipy.io.wavfile as scipy_io_wavfile

from numpngw import write_png

from PIL import Image

def three_body_planar(t, y): # barycenter. stealed from internet
    x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3 = y

    ax1 = m2 * (x2-x1) / math.sqrt((x1-x2)**2 + (y1-y2)**2)**3 + m3 * (x3-x1) / math.sqrt((x1-x3)**2 + (y1-y3)**2)**3
    ay1 = m2 * (y2-y1) / math.sqrt((x1-x2)**2 + (y1-y2)**2)**3 + m3 * (y3-y1) / math.sqrt((x1-x3)**2 + (y1-y3)**2)**3
    
    ax2 = m3 * (x3-x2) / math.sqrt((x2-x3)**2 + (y2-y3)**2)**3 + m1 * (x1-x2) / math.sqrt((x2-x1)**2 + (y2-y1)**2)**3
    ay2 = m3 * (y3-y2) / math.sqrt((x2-x3)**2 + (y2-y3)**2)**3 + m1 * (y1-y2) / math.sqrt((x2-x1)**2 + (y2-y1)**2)**3
    
    ax3 = m1 * (x1-x3) / math.sqrt((x3-x1)**2 + (y3-y1)**2)**3 + m2 * (x2-x3) / math.sqrt((x3-x2)**2 + (y3-y2)**2)**3
    ay3 = m1 * (y1-y3) / math.sqrt((x3-x1)**2 + (y3-y1)**2)**3 + m3 * (y2-y3) / math.sqrt((x3-x2)**2 + (y3-y2)**2)**3

    return [vx1, vy1, ax1, ay1, vx2, vy2, ax2, ay2, vx3, vy3, ax3, ay3]

############################################################ conditions ############################################################
conditions = {}
conditions['Bruck R4'] = 1., 1., 1., [0.8733047091, 0., 0., 1.010776444, -0.6254030288, 0., 0., -1.683353346, -0.2479016803, 0., 0., 0.6725769022], 5.4
conditions['Sheen 2016'] = 1., 1., 1., [0.5363870734, 0.05408860501, -0.5693795856, 1.255291103, -0.2520991265, 0.6945273277, 0.07964461525, -0.4586259973, -0.2757066017, -0.3359335893, 0.4897349703, -0.7966651052], 5.1
#conditions['FIGURE 8'] = 1., 1., 1., [-1., 0., 0.347111, 0.532728, 1., 0., 0.347111, 0.532728, 0., 0., -2*0.347111, -2*0.532728], 6.324449


# article
# A guide to hunting periodic three-body orbits

preconditions = []
preconditions.append(('M8', 0.3471128135672417, 0.532726851767674,  6.3250))
preconditions.append(('S8', 0.3393928985595663, 0.536191205596924,  6.2917))
preconditions.append(('NC1',    0.2554309326049807, 0.516385834327506,  35.042))
preconditions.append(('NC2',    0.4103549868164067, 0.551985438720704,  57.544))
preconditions.append(('O1', 0.2034916865234370, 0.5181128588867190, 32.850))
preconditions.append(('O2', 0.4568108129224680, 0.5403305086130216, 64.834))
preconditions.append(('O3', 0.2022171409759519, 0.5311040339355467, 53.621))
preconditions.append(('O4', 0.2712627822083244, 0.5132559436920279, 55.915))
preconditions.append(('O5', 0.2300043496704103, 0.5323028446350102, 71.011))
preconditions.append(('O6', 0.2108318037109371, 0.5174100244140625, 80.323))
preconditions.append(('O7', 0.2132731670875545, 0.5165434524230961, 80.356))
preconditions.append(('O8', 0.2138543002929687, 0.5198665707397461, 81.217))
preconditions.append(('O9', 0.2193730914764402, 0.5177814195442197, 81.271))
preconditions.append(('O10',    0.2272123532714848, 0.5200484344272606, 82.671))
preconditions.append(('O11',    0.2199766127929685, 0.5234338500976567, 82.743))
preconditions.append(('O12',    0.2266987607727048, 0.5246235168190009, 83.786))
preconditions.append(('O13',    0.2686383642458915, 0.5227270888731481, 88.674))
preconditions.append(('O14',    0.2605047016601568, 0.5311685141601564, 89.941))
preconditions.append(('O15',    0.2899041109619139, 0.5226240653076171, 91.982))
preconditions.append(('I.A.1 butterfly I',  0.306892758965492,  0.125506782829762,  6.23564136316479))
preconditions.append(('I.A.2 butterfly II', 0.392955223941802,  0.0975792352080344, 7.00390738764014))
preconditions.append(('I.B.3 butterfly III',    0.405915588857606,  0.230163127422333,  13.8657626785699))
preconditions.append(('I.B.6 butterfly IV', 0.350112121391296,  0.0793394773483276, 79.4758748952101))
preconditions.append(('I.A.3 bumblebee',    0.184278506469727,  0.587188195800781,  63.5345412733264))
preconditions.append(('I.B.1 moth I',   0.464445237398184,  0.396059973403921,  14.8939113169584))
preconditions.append(('I.B.2 moth II',  0.439165939331987,  0.452967645644678,  28.6702783225658))
preconditions.append(('I.B.4 moth III', 0.383443534851074,  0.377363693237305,  25.8406180475758))
preconditions.append(('I.B.5 goggles',  0.0833000564575194, 0.127889282226563,  10.4668176954385))
preconditions.append(('I.B.7 dragonfly',    0.080584285736084,  0.588836087036132,  21.2709751966648))
preconditions.append(('II.B.1 yarn',    0.559064247131347,  0.349191558837891,  55.5017624421301))
preconditions.append(('II.C.2a yin-yang I', 0.513938054919243,  0.304736003875733,  17.328369755004))
preconditions.append(('II.C.2b yin-yang I', 0.282698682308198,  0.327208786129952,  10.9625630756217))
preconditions.append(('II.C.3a yin-yang II',    0.416822143554688,  0.330333312988282,  55.78982856891))
preconditions.append(('II.C.3b yin-yang II',    0.417342877101898,  0.313100116109848,  54.2075992141846))

for item in preconditions:
    name, px, py, T = item
    conditions[name] = 1., 1., 1., [-1., 0., px, py, 1., 0., px, py, 0., 0., -2*px, -2*py], T


# site http://three-body.ipb.ac.rs
# Solutions by Matthew Sheen

conditions['Ovals with flourishes'] = 1., 1., 1., [0.716248295713, 0.384288553041, 1.245268230896, 2.444311951777, 0.086172594591, 1.342795868577, -0.675224323690, -0.962879613630, 0.538777980808, 0.481049882656, -0.570043907206, -1.481432338147], 8.094721
conditions['Oval, catface, and starship'] = 1., 1., 1., [0.536387073390, 0.054088605008, -0.569379585581, 1.255291102531, -0.252099126491, 0.694527327749, 0.079644615252, -0.458625997341, -0.275706601688, -0.335933589318, 0.489734970329, -0.796665105189], 5.026055
conditions['Skinny pineapple'] = 1., 1., 1., [0.419698802831, 1.190466261252, 0.102294566003, 0.687248445943, 0.076399621771, 0.296331688995, 0.148950262064, 0.240179781043, 0.100310663856, -0.729358656127, -0.251244828060, -0.927428226977], 5.095054
conditions['Hand-in-hand-in-oval'] = 1., 1., 1., [0.906009977921, 0.347143444587, 0.242474965162, 1.045019736387, -0.263245299491, 0.140120037700, -0.360704684300, -0.807167979922, -0.252150695248, -0.661320078799, 0.118229719138, -0.237851756465], 6.868156
conditions['PT1'] = 1., 1., 1., [0.708322208567, 0.473311928207, 0.824266639920, 0.522197827478, 0.167739458699, -0.057913961029, -0.077017015655, -0.167288552679, -0.506578687024, -0.306825234531, -0.747249624265, -0.354909274800], 5.403011
conditions['PT2'] = 1., 1., 1., [0.865355422048, 0.629488893636, 0.288687787607, 0.171289709267, 0.085036793559, -0.013305780704, -0.220256752039, 0.090375753071, -0.090983494772, -0.892179296799, -0.068431035568, -0.261665462337], 5.427986

# article
# A guide to hunting periodic three-body orbits
# site http://three-body.ipb.ac.rs
# BROUCKE-HADJIDEMETRIOU-HENON TOPOLOGICAL CLASS
# ROGER BROUCKE

preconditions_ = []

preconditions_.append(('Broucke A 1', 6.283213, [(-0.9892620043,0.0000000000),
(2.2096177241,0.0000000000),
(-1.2203557197,0.0000000000)], [(0.0000000000,1.9169244185),
(0.0000000000,0.1910268738),
(0.0000000000,-2.1079512924)]))

preconditions_.append(('Broucke A 2', 7.702408, [(0.3361300950,0.0000000000),
(0.7699893804,0.0000000000),
(-1.1061194753,0.0000000000)], [(0.0000000000,1.5324315370),
(0.0000000000,-0.6287350978),
(0.0000000000,-0.9036964391)]))


preconditions_.append(('Broucke A 3', 7.910268, [(0.3149337497,0.0000000000),
(0.8123820710,0.0000000000),
(-1.1273158206,0.0000000000)], [(0.0000000000,1.4601869417),
(0.0000000000,-0.5628292375),
(0.0000000000,-0.8973577042)]))


preconditions_.append(('Broucke A 4', 8.211617, [(0.2843198916,0.0000000000),
(0.8736097872,0.0000000000),
(-1.1579296788,0.0000000000)], [(0.0000000000,1.3774179570),
(0.0000000000,-0.4884226932),
(0.0000000000,-0.8889952638)]))

preconditions_.append(('Broucke A 5', 8.689105, [(0.2355245585,0.0000000000),
(0.9712004534,0.0000000000),
(-1.2067250118,0.0000000000)], [(0.0000000000,1.2795329643),
(0.0000000000,-0.4021329019),
(0.0000000000,-0.8774000623)]))

preconditions_.append(('Broucke A 6', 9.593323, [(0.1432778606,0.0000000000),
(1.1556938491,0.0000000000),
(-1.2989717097,0.0000000000)], [(0.0000000000,1.1577475241),
(0.0000000000,-0.2974667752),
(0.0000000000,-0.8602807489)]))

preconditions_.append(('Broucke A 7', 12.055859, [(-0.1095519101,0.0000000000),
(1.6613533905,0.0000000000),
(-1.5518014804,0.0000000000)], [(0.0000000000,0.9913358338),
(0.0000000000,-0.1569959746),
(0.0000000000,-0.8343398592)]))

preconditions_.append(('Broucke A 8', 18.118189, [(0.1979259967,0.0000000000),
(1.0463975768,0.0000000000),
(-1.2443235736,0.0000000000)], [(0.0000000000,1.2224733132),
(0.0000000000,-0.3527351133),
(0.0000000000,-0.8697381999)]))

preconditions_.append(('Broucke A 9', 20.897689, [(0.0557080334,0.0000000000),
(1.3308335036,0.0000000000),
(-1.3865415370,0.0000000000)], [(0.0000000000,1.0824099428),
(0.0000000000,-0.2339059386),
(0.0000000000,-0.8485040042)]))

preconditions_.append(('Broucke A 10', 32.610953, [(-0.5426216182,0.0000000000),
(2.5274928067,0.0000000000),
(-1.9848711885,0.0000000000)], [(0.0000000000,0.8750200467),
(0.0000000000,-0.0526955841),
(0.0000000000,-0.8223244626)]))

preconditions_.append(('Broucke A 11', 32.584945, [(0.0132604844,0.0000000000),
(1.4157286016,0.0000000000),
(-1.4289890859,0.0000000000)], [(0.0000000000,1.0541519210),
(0.0000000000,-0.2101466639),
(0.0000000000,-0.8440052572)]))

preconditions_.append(('Broucke A 12', 42.823219, [(-0.3370767020,0.0000000000),
(2.1164029743,0.0000000000),
(-1.7793262723,0.0000000000)], [(0.0000000000,0.9174260238),
(0.0000000000,-0.0922665014),
(0.0000000000,-0.8251595224)]))

preconditions_.append(('Broucke A 13', 59.716075, [(-0.8965015243,0.0000000000),
(3.2352526189,0.0000000000),
(-2.3387510946,0.0000000000)], [(0.0000000000,0.8285556923),
(0.0000000000,-0.0056478094),
(0.0000000000,-0.8229078829)]))

preconditions_.append(('Broucke A 14', 54.230811, [(-0.2637815221,0.0000000000),
(1.9698126146,0.0000000000),
(-1.7060310924,0.0000000000)], [(0.0000000000,0.9371630895),
(0.0000000000,-0.1099503287),
(0.0000000000,-0.8272127608)]))

preconditions_.append(('Broucke A 15', 92.056119, [(-1.1889693067,0.0000000000),
(3.8201881837,0.0000000000),
(-2.6312188770,0.0000000000)], [(0.0000000000,0.8042120498),
(0.0000000000,0.0212794833),
(0.0000000000,-0.8254915331)]))

preconditions_.append(('Broucke A 16', 90.871196, [(-0.7283341038,0.0000000000),
(2.8989177778,0.0000000000),
(-2.1705836741,0.0000000000)], [(0.0000000000,0.8475982451),
(0.0000000000,-0.0255162097),
(0.0000000000,-0.8220820354)]))

preconditions_.append(('Broucke R 1', 5.226525, [(0.8083106230,0.0000000000),
(-0.4954148566,0.0000000000),
(-0.3128957664,0.0000000000)], [(0.0000000000,0.9901979166),
(0.0000000000,-2.7171431768),
(0.0000000000,1.7269452602)]))

preconditions_.append(('Broucke R 2', 5.704198, [(0.9060893715,0.0000000000),
(-0.6909723536,0.0000000000),
(-0.2151170179,0.0000000000)], [(0.0000000000,0.9658548899),
(0.0000000000,-1.6223214842),
(0.0000000000,0.6564665942)]))

preconditions_.append(('Broucke R 3', 5.560814, [(0.8920281421,0.0000000000),
(-0.6628498947,0.0000000000),
(-0.2291782474,0.0000000000)], [(0.0000000000,0.9957939373),
(0.0000000000,-1.6191613336),
(0.0000000000,0.6233673964)]))

preconditions_.append(('Broucke R 4', 5.395826, [(0.8733047091,0.0000000000),
(-0.6254030288,0.0000000000),
(-0.2479016803,0.0000000000)], [(0.0000000000,1.0107764436),
(0.0000000000,-1.6833533458),
(0.0000000000,0.6725769022)]))

preconditions_.append(('Broucke R 5', 5.266911, [(0.8584630769,0.0000000000),
(-0.5957197644,0.0000000000),
(-0.2627433125,0.0000000000)], [(0.0000000000,1.0204773541),
(0.0000000000,-1.7535566440),
(0.0000000000,0.7330792899)]))

preconditions_.append(('Broucke R 6', 5.167384, [(0.8469642946,0.0000000000),
(-0.5727221998,0.0000000000),
(-0.2742420948,0.0000000000)], [(0.0000000000,1.0275065708),
(0.0000000000,-1.8209307202),
(0.0000000000,0.7934241494)]))

preconditions_.append(('Broucke R 7', 5.088604, [(0.8378824453,0.0000000000),
(-0.5545585011,0.0000000000),
(-0.2833239442,0.0000000000)], [(0.0000000000,1.0329242005),
(0.0000000000,-1.8840083393),
(0.0000000000,0.8510841387)]))

preconditions_.append(('Broucke R 8', 11.224844, [(0.8871256555,0.0000000000),
(-0.6530449215,0.0000000000),
(-0.2340807340,0.0000000000)], [(0.0000000000,0.9374933545),
(0.0000000000,-1.7866975426),
(0.0000000000,0.8492041880)]))

preconditions_.append(('Broucke R 9', 11.295591, [(0.9015586070,0.0000000000),
(-0.6819108246,0.0000000000),
(-0.2196477824,0.0000000000)], [(0.0000000000,0.9840575737),
(0.0000000000,-1.6015183264),
(0.0000000000,0.6174607527)]))

preconditions_.append(('Broucke R 10', 10.948278, [(0.8822391241,0.0000000000),
(-0.6432718586,0.0000000000),
(-0.2389672654,0.0000000000)], [(0.0000000000,1.0042424155),
(0.0000000000,-1.6491842814),
(0.0000000000,0.6449418659)]))

preconditions_.append(('Broucke R 11', 17.021765, [(0.8983487470,0.0000000000),
(-0.6754911045,0.0000000000),
(-0.2228576425,0.0000000000)], [(0.0000000000,0.9475564971),
(0.0000000000,-1.7005860354),
(0.0000000000,0.7530295383)]))

preconditions_.append(('Broucke R 12', 17.020603, [(0.9040866398,0.0000000000),
(-0.6869668901,0.0000000000),
(-0.2171197497,0.0000000000)], [(0.0000000000,0.9789534005),
(0.0000000000,-1.6017790202),
(0.0000000000,0.6228256196)]))

preconditions_.append(('Broucke R 13', 22.764421, [(0.9017748598,0.0000000000),
(-0.6823433302,0.0000000000),
(-0.2194315296,0.0000000000)], [(0.0000000000,0.9526089117),
(0.0000000000,-1.6721104565),
(0.0000000000,0.7195015448)]))


for item in preconditions_:
    name, T, rs, vs = item
    conditions[name] = 1., 1., 1., [rs[0][0], rs[0][1], vs[0][0], vs[0][1], rs[1][0], rs[1][1], vs[1][0], vs[1][1], rs[2][0], rs[2][1], vs[2][0], vs[2][1]], T

############################################################ conditions ############################################################

def smoothstep(mi, mx, value): # needed for drawing
    t = (value-mi)/(mx-mi)
    
    t = max(0., t)
    t = min(1., t)
    
    return t*t*(3-2*t)

def squareNorm(vec): # needed for drawing
    return np.sum(vec**2)

def make_texture(x0, y0, x1, y1, x2, y2, name):
    tex = np.zeros((len(x0), 3, 3))
    for i in range(len(x0)):
        tex[i,0,0] = x0[i]
        tex[i,0,1] = y0[i]
        tex[i,1,0] = x1[i]
        tex[i,1,1] = y1[i]
        tex[i,2,0] = x2[i]
        tex[i,2,1] = y2[i]

    mx = np.max(tex)
    mn = np.min(tex)

    scale = max(mx, -mn)

    tex /= scale
    tex *= 0.49
    tex += .5
    tex *= 255

    write_png(f'textures/{name}.png', tex.astype(np.uint8))

for key in conditions.keys():
    # Initial conditions: [x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3]
    m1, m2, m3, y0, T = conditions[key]

    # Time span
    L = 1
    n_cycle_points = 600
    t_max = L*T
    t_span = (0, t_max)
    t_eval = np.linspace(0, t_max, int(L * n_cycle_points))

    # Solve the system
    sol = solve_ivp(three_body_planar, t_span, y0, t_eval=t_eval, method="LSODA", atol=10**-15, rtol=10**-12)

    # check periodichnost
    if False:
        print(key)
        print(sol.y[0, 0], sol.y[0, -1])
        print(sol.y[1, 0], sol.y[1, -1])
        print(sol.y[4, 0], sol.y[4, -1])
        print(sol.y[5, 0], sol.y[5, -1])
        print(sol.y[8, 0], sol.y[8, -1])
        print(sol.y[9, 0], sol.y[9, -1])
        print()

    if True:
        make_texture(sol.y[0], sol.y[1], sol.y[4], sol.y[5], sol.y[8], sol.y[9], key)

    # Plot the results
    if False:
        plt.figure(figsize=(8, 8))
        plt.plot(sol.y[0], sol.y[1], label="Body 1")
        plt.plot(sol.y[4], sol.y[5], label="Body 2")
        plt.plot(sol.y[8], sol.y[9], label="Body 3")

        plt.xlabel("x")
        plt.ylabel("y")
        plt.legend()
        plt.title(f"Three-Body Planar Problem {key}")

        if False:
            # export figures
            plt.savefig(f'figurebank/{key}.png')
            plt.clf()
        else:
            # show figures
            plt.show()

    # save wav sound
    if True:
        coords = {}
        coords['0x'] = sol.y[0]
        coords['0y'] = sol.y[1]
        coords['1x'] = sol.y[4]
        coords['1y'] = sol.y[5]
        coords['2x'] = sol.y[8]
        coords['2y'] = sol.y[9]

        fade_len = 40
        fade_in  = np.linspace(0,1, fade_len)
        fade_out = np.linspace(1,0, fade_len)

        for axis, coord in coords.items():

            mx = np.max(coord)
            mn = np.min(coord)
            
            wave = np.concatenate([coord[:-1]]*100)
            
            wave -= mn
            wave /= mx - mn
            wave -= .5
            wave *= 1.9

            wave[ :fade_len] = wave[ :fade_len] * fade_in
            wave[-fade_len:] = wave[-fade_len:] * fade_out

            scipy_io_wavfile.write(f"soundbank!/{key}_{axis}_sound.wav",48000,(wave).astype(np.float32))

# make gif
if False:
    image_size = 300
    arr = np.zeros((image_size,image_size,3),dtype=np.uint8)
    
    frames = []
    for i in range(len(sol.y[0])):
        if i == 30:
            break

        p = np.array([sol.y[0][i], sol.y[1][i]])
        
        #arr[:] = 0
        arr = np.zeros((image_size,image_size,3),dtype=np.uint8)
        
        for u in range(image_size):
            for v in range(image_size):
                uv = np.array([u,v], dtype=np.float32)
                uv /= image_size
                uv -= .5;
                
                arr[u,v,0] = 255 * smoothstep(0.002, 0., squareNorm(uv-p))
                arr[u,v,1] = 255 * smoothstep(0.002, 0., squareNorm(uv-p))
        
        frames.append(Image.fromarray(arr, mode='RGB'))
    
    frames[0].save("circle.gif", format="GIF", append_images=frames[1:],
                   save_all=True, duration=10, loop=0)

def make_gif(x0, y0, x1, y1, x2, y2):
    image_size = 300
    frames = []
    for frame_i in range(len(x0)):
        print(frame_i, "from", len(x0))

        arr = np.zeros((image_size,image_size,3),dtype=np.uint8)
        
        for u in range(image_size):
            for v in range(image_size):

                uv = np.array([u,v], dtype=np.float32)
                uv /= image_size
                uv -= .5
                uv *= 3.

                arr[u,v,0] += smoothstep(0.7, 0., squareNorm(np.array([x0[frame_i], y0[frame_i]]) - uv));
                arr[u,v,0] *= 0.14;
                arr[u,v,1] += smoothstep(0.7, 0., squareNorm(np.array([x1[frame_i], y1[frame_i]]) - uv));
                arr[u,v,1] *= 0.14;
                arr[u,v,2] += smoothstep(0.7, 0., squareNorm(np.array([x2[frame_i], y2[frame_i]]) - uv));
                arr[u,v,2] *= 0.14;


                for i in range(300):
                    j = - i + frame_i + n_cycle_points;
                    j %= n_cycle_points;
                    
                    scale = 1. / math.sqrt(float(i+4));
                    r_ = smoothstep(0.1 * scale, 0., squareNorm(np.array([x0[j], y0[j]] - uv)))
                    g_ = smoothstep(0.1 * scale, 0., squareNorm(np.array([x1[j], y1[j]] - uv)))
                    b_ = smoothstep(0.1 * scale, 0., squareNorm(np.array([x2[j], y2[j]] - uv)))
                    
                    arr[u,v,0] += r_;
                    arr[u,v,1] += r_ * 0.1 * scale;
                    arr[u,v,2] += r_ * 0.1 * scale;
                    
                    arr[u,v,1] += g_;
                    arr[u,v,2] += g_ * 0.1 * scale;
                    arr[u,v,0] += g_ * 0.1 * scale;
                    
                    arr[u,v,2] += b_;
                    arr[u,v,0] += b_ * 0.1 * scale;
                    arr[u,v,1] += b_ * 0.1 * scale;

                arr[u,v,0] *= 255
                arr[u,v,1] *= 255
                arr[u,v,2] *= 255
        
        frames.append(Image.fromarray(arr, mode='RGB'))
    
    frames[0].save("circle.gif", format="GIF", append_images=frames[1:],
                   save_all=True, duration=10, loop=0)

#make_gif(sol.y[0], sol.y[1], sol.y[4], sol.y[5], sol.y[8], sol.y[9])

# draw fourier
if False:
    wave0 = np.concatenate([bc[0][0:-1]]*100)

    N = int(len(wave0))
    T = 1. / 44100.
    yf = fft(wave0)
    xf = fftfreq(N, T)[:N//2]

    plt.plot(xf, 2.0/N * np.abs(yf[0:N//2]))
    plt.grid()
    plt.xscale('log')
    plt.yscale('log')
    plt.show()

# make animation
if False:
    fig, ax = plt.subplots()
    xdata, ydata = [], []
    ln, = ax.plot([], [], 'ro')
    
    def init():
        ax.set_xlim(-2, 2)
        ax.set_ylim(-2, 2)
        return ln,
    
    tail = 100

    def update(frame):
        xdata = np.concatenate([sol.y[0][frame - tail:frame + tail], sol.y[4][frame:frame + tail]])
        ydata = np.concatenate([sol.y[1][frame - tail:frame + tail], sol.y[5][frame:frame + tail]])
    
        ln.set_data(xdata, ydata)
        return ln,
    
    ani = FuncAnimation(fig, update, frames=n_cycle_points-1,
                        init_func=init, blit=True)
    plt.show()


